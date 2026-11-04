-- API-223: server-owned period boundaries and comparable aggregates.
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
  local_reference timestamp;
  current_local_start timestamp;
  current_start timestamptz;
  current_end timestamptz;
  previous_start timestamptz;
  previous_end timestamptz;
  current_metrics jsonb;
  previous_metrics jsonb;
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
  -- Convert local civil-time boundaries only after doing calendar arithmetic.
  -- This keeps DST transitions at the correct wall-clock boundary.
  current_start := current_local_start at time zone p_timezone;
  current_end := (current_local_start + case p_period
    when 'day' then interval '1 day'
    when 'week' then interval '1 week'
    when 'month' then interval '1 month'
    when 'year' then interval '1 year'
  end) at time zone p_timezone;
  previous_start := (current_local_start - case p_period
    when 'day' then interval '1 day'
    when 'week' then interval '1 week'
    when 'month' then interval '1 month'
    when 'year' then interval '1 year'
  end) at time zone p_timezone;
  previous_end := current_start;

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
  where occurred_at >= current_start and occurred_at < current_end;

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
  where occurred_at >= previous_start and occurred_at < previous_end;

  return jsonb_build_object(
    'period', p_period,
    'timezone', p_timezone,
    'reference', p_reference,
    'current', jsonb_build_object('start', current_start, 'end', current_end, 'metrics', current_metrics),
    'previous', jsonb_build_object('start', previous_start, 'end', previous_end, 'metrics', previous_metrics)
  );
end;
$$;

comment on function public.get_analytics_summary_period(text, timestamptz, text) is
  'Returns aggregate analytics for the current and immediately preceding comparable calendar period; never returns raw events.';
revoke execute on function public.get_analytics_summary_period(text, timestamptz, text) from public, anon;
grant execute on function public.get_analytics_summary_period(text, timestamptz, text) to authenticated;
