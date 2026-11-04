-- API-231: one server-owned calendar contract for all analytics aggregates.
-- Keep the previous start/end RPCs for existing clients while adding period-based
-- overloads for rankings and audience.
create or replace function public.get_analytics_period_bounds(
  p_period text,
  p_reference timestamptz,
  p_timezone text
) returns table (
  current_start timestamptz,
  current_end timestamptz,
  previous_start timestamptz,
  previous_end timestamptz
)
language plpgsql
stable
security invoker
as $$
declare
  local_reference timestamp;
  current_local_start timestamp;
  period_interval interval;
begin
  if (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'insufficient privilege';
  end if;

  if p_period is null or p_period not in ('day', 'week', 'month', 'year') then
    raise exception 'invalid period';
  end if;
  if p_reference is null then
    raise exception 'reference is required';
  end if;
  if p_timezone is null or length(trim(p_timezone)) = 0
     or not exists (select 1 from pg_timezone_names where name = p_timezone) then
    raise exception 'invalid timezone';
  end if;

  local_reference := p_reference at time zone p_timezone;
  current_local_start := date_trunc(p_period, local_reference);
  period_interval := case p_period
    when 'day' then interval '1 day'
    when 'week' then interval '1 week'
    when 'month' then interval '1 month'
    when 'year' then interval '1 year'
  end;

  -- Do calendar arithmetic in civil time, then convert endpoints to UTC. This
  -- makes DST days 23/25 hours when appropriate without overlapping ranges.
  return query select
    current_local_start at time zone p_timezone,
    (current_local_start + period_interval) at time zone p_timezone,
    (current_local_start - period_interval) at time zone p_timezone,
    current_local_start at time zone p_timezone;
end;
$$;

comment on function public.get_analytics_period_bounds(text, timestamptz, text) is
  'Administrative server-owned half-open calendar boundaries for analytics aggregates.';
revoke execute on function public.get_analytics_period_bounds(text, timestamptz, text) from public, anon;
grant execute on function public.get_analytics_period_bounds(text, timestamptz, text) to authenticated;

create or replace function public.get_analytics_summary_period(
  p_period text,
  p_reference timestamptz,
  p_timezone text
) returns jsonb
language plpgsql
stable
security invoker
as $$
declare
  bounds record;
  current_metrics jsonb;
  previous_metrics jsonb;
begin
  select * into bounds
  from public.get_analytics_period_bounds(p_period, p_reference, p_timezone);

  select jsonb_build_object(
    'activeDevices', count(distinct anonymous_id) filter (where event_type = 'session_started'),
    'sessions', count(distinct session_id),
    'completedReadings', count(*) filter (where event_type = 'reading_completed'),
    'viewedResources', count(*) filter (where event_type = 'resource_viewed'),
    'shares', count(*) filter (where event_type = 'content_shared'),
    'installations', count(*) filter (where event_type = 'pwa_installed'),
    'videoViews', count(*) filter (where event_type = 'video_viewed'),
    'announcementClicks', count(*) filter (where event_type = 'announcement_clicked'),
    'androidUsers', count(distinct anonymous_id) filter (where operating_system = 'android'),
    'iosUsers', count(distinct anonymous_id) filter (where operating_system = 'ios'),
    'browserUsers', count(distinct anonymous_id) filter (where display_mode = 'browser'),
    'installedUsers', count(distinct anonymous_id) filter (where display_mode = 'standalone')
  ) into current_metrics
  from public.analytics_events
  where occurred_at >= bounds.current_start and occurred_at < bounds.current_end;

  select jsonb_build_object(
    'activeDevices', count(distinct anonymous_id) filter (where event_type = 'session_started'),
    'sessions', count(distinct session_id),
    'completedReadings', count(*) filter (where event_type = 'reading_completed'),
    'viewedResources', count(*) filter (where event_type = 'resource_viewed'),
    'shares', count(*) filter (where event_type = 'content_shared'),
    'installations', count(*) filter (where event_type = 'pwa_installed'),
    'videoViews', count(*) filter (where event_type = 'video_viewed'),
    'announcementClicks', count(*) filter (where event_type = 'announcement_clicked'),
    'androidUsers', count(distinct anonymous_id) filter (where operating_system = 'android'),
    'iosUsers', count(distinct anonymous_id) filter (where operating_system = 'ios'),
    'browserUsers', count(distinct anonymous_id) filter (where display_mode = 'browser'),
    'installedUsers', count(distinct anonymous_id) filter (where display_mode = 'standalone')
  ) into previous_metrics
  from public.analytics_events
  where occurred_at >= bounds.previous_start and occurred_at < bounds.previous_end;

  return jsonb_build_object(
    'period', p_period,
    'timezone', p_timezone,
    'reference', p_reference,
    'current', jsonb_build_object('start', bounds.current_start, 'end', bounds.current_end, 'metrics', current_metrics),
    'previous', jsonb_build_object('start', bounds.previous_start, 'end', bounds.previous_end, 'metrics', previous_metrics)
  );
end;
$$;

create or replace function public.get_analytics_rankings(
  p_period text,
  p_reference timestamptz,
  p_timezone text
) returns jsonb
language sql
stable
security invoker
as $$
  with bounds as (
    select * from public.get_analytics_period_bounds(p_period, p_reference, p_timezone)
  ), announcement_totals as (
    select event_data->>'announcementId' as id, count(*)::bigint as total
    from public.analytics_events, bounds
    where event_type = 'announcement_clicked'
      and occurred_at >= bounds.current_start and occurred_at < bounds.current_end
    group by event_data->>'announcementId'
    order by total desc, id asc nulls first limit 5
  ), video_totals as (
    select event_data->>'resourceId' as id, count(*)::bigint as total
    from public.analytics_events, bounds
    where event_type = 'video_viewed'
      and occurred_at >= bounds.current_start and occurred_at < bounds.current_end
    group by event_data->>'resourceId'
    order by total desc, id asc nulls first limit 5
  ), resource_totals as (
    select event_data->>'resourceId' as id, count(*)::bigint as total
    from public.analytics_events, bounds
    where event_type = 'resource_viewed'
      and occurred_at >= bounds.current_start and occurred_at < bounds.current_end
    group by event_data->>'resourceId'
    order by total desc, id asc nulls first limit 5
  ), completed_totals as (
    select event_data->>'segmentId' as id, count(*)::bigint as total
    from public.analytics_events, bounds
    where event_type = 'reading_completed'
      and occurred_at >= bounds.current_start and occurred_at < bounds.current_end
    group by event_data->>'segmentId'
    order by total desc, id asc nulls first limit 5
  ), shared_totals as (
    select event_data->>'entityId' as id, count(*)::bigint as total
    from public.analytics_events, bounds
    where event_type = 'content_shared' and event_data->>'entityType' = 'segment'
      and occurred_at >= bounds.current_start and occurred_at < bounds.current_end
    group by event_data->>'entityId'
    order by total desc, id asc nulls first limit 5
  )
  select jsonb_build_object(
    'announcements', coalesce((select jsonb_agg(row_to_json(item) order by item.total desc, item.id asc nulls first) from announcement_totals item), '[]'::jsonb),
    'videos', coalesce((select jsonb_agg(row_to_json(item) order by item.total desc, item.id asc nulls first) from video_totals item), '[]'::jsonb),
    'resources', coalesce((select jsonb_agg(row_to_json(item) order by item.total desc, item.id asc nulls first) from resource_totals item), '[]'::jsonb),
    'segmentsCompleted', coalesce((select jsonb_agg(row_to_json(item) order by item.total desc, item.id asc nulls first) from completed_totals item), '[]'::jsonb),
    'segmentsShared', coalesce((select jsonb_agg(row_to_json(item) order by item.total desc, item.id asc nulls first) from shared_totals item), '[]'::jsonb)
  );
$$;

comment on function public.get_analytics_rankings(text, timestamptz, text) is
  'Administrative content rankings for a server-owned half-open calendar period.';
revoke execute on function public.get_analytics_rankings(text, timestamptz, text) from public, anon;
grant execute on function public.get_analytics_rankings(text, timestamptz, text) to authenticated;

create or replace function public.get_analytics_audience_distribution(
  p_period text,
  p_reference timestamptz,
  p_timezone text
) returns jsonb
language sql
stable
security invoker
as $$
  select public.get_analytics_audience_distribution(bounds.current_start, bounds.current_end)
  from public.get_analytics_period_bounds(p_period, p_reference, p_timezone) as bounds;
$$;

comment on function public.get_analytics_audience_distribution(text, timestamptz, text) is
  'Administrative audience distribution for a server-owned half-open calendar period.';
revoke execute on function public.get_analytics_audience_distribution(text, timestamptz, text) from public, anon;
grant execute on function public.get_analytics_audience_distribution(text, timestamptz, text) to authenticated;
