-- API: Dashboard analytics time series and labels from persisted content.

create or replace function public.get_analytics_timeseries(
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
  bucket text;
begin
  select * into bounds from public.get_analytics_period_bounds(p_period, p_reference, p_timezone);
  bucket := case p_period when 'day' then 'hour' when 'week' then 'day'
    when 'month' then 'day' when 'year' then 'month' end;

  return jsonb_build_object(
    'period', p_period, 'timezone', p_timezone, 'start', bounds.current_start,
    'end', bounds.current_end,
    'points', coalesce((
      with local_bounds as (
        select bounds.current_start at time zone p_timezone as local_start,
          bounds.current_end at time zone p_timezone as local_end
      ), buckets as (
        select generate_series(local_start, local_end - case bucket
          when 'hour' then interval '1 hour' when 'day' then interval '1 day'
          else interval '1 month' end, case bucket when 'hour' then interval '1 hour'
          when 'day' then interval '1 day' else interval '1 month' end) as local_start
        from local_bounds
      ), bucket_metrics as (
        select b.local_start,
          count(distinct e.anonymous_id) filter (where e.event_type = 'session_started') as active_devices,
          count(distinct e.session_id) as sessions,
          count(*) filter (where e.event_type = 'reading_completed') as completed_readings,
          count(*) filter (where e.event_type = 'resource_viewed') as viewed_resources,
          count(*) filter (where e.event_type = 'content_shared') as shares,
          count(*) filter (where e.event_type = 'video_viewed') as video_views,
          count(*) filter (where e.event_type = 'announcement_clicked') as announcement_clicks
        from buckets b left join public.analytics_events e on e.occurred_at >= b.local_start at time zone p_timezone
          and e.occurred_at < (b.local_start + case bucket when 'hour' then interval '1 hour'
            when 'day' then interval '1 day' else interval '1 month' end) at time zone p_timezone
        group by b.local_start
      )
      select jsonb_agg(jsonb_build_object(
        'start', b.local_start at time zone p_timezone,
        'end', (b.local_start + case bucket when 'hour' then interval '1 hour'
          when 'day' then interval '1 day' else interval '1 month' end) at time zone p_timezone,
        'metrics', jsonb_build_object(
          'activeDevices', b.active_devices,
          'sessions', b.sessions,
          'completedReadings', b.completed_readings,
          'viewedResources', b.viewed_resources,
          'shares', b.shares,
          'videoViews', b.video_views,
          'announcementClicks', b.announcement_clicks
        )
      ) order by b.local_start)
      from bucket_metrics b
    ), '[]'::jsonb)
  );
end;
$$;

comment on function public.get_analytics_timeseries(text, timestamptz, text) is
  'Administrative analytics time series using the same server-owned calendar bounds as dashboard aggregates.';
revoke execute on function public.get_analytics_timeseries(text, timestamptz, text) from public, anon;
grant execute on function public.get_analytics_timeseries(text, timestamptz, text) to authenticated;

create or replace function public.get_analytics_rankings(
  p_period text, p_reference timestamptz, p_timezone text
) returns jsonb
language sql stable security invoker
as $$
  with bounds as (select * from public.get_analytics_period_bounds(p_period, p_reference, p_timezone)),
  announcement_totals as (
    select e.event_data->>'announcementId' id, count(*)::bigint total,
      null::text title from public.analytics_events e
      cross join bounds where e.event_type = 'announcement_clicked'
      and e.occurred_at >= bounds.current_start and e.occurred_at < bounds.current_end
      group by e.event_data->>'announcementId' order by total desc, id asc nulls first limit 5
  ), video_totals as (
    select e.event_data->>'resourceId' id, count(*)::bigint total,
      null::text title from public.analytics_events e cross join bounds
      where e.event_type = 'video_viewed' and e.occurred_at >= bounds.current_start and e.occurred_at < bounds.current_end
      group by e.event_data->>'resourceId' order by total desc, id asc nulls first limit 5
  ), resource_totals as (
    select e.event_data->>'resourceId' id, count(*)::bigint total,
      null::text title from public.analytics_events e cross join bounds
      where e.event_type = 'resource_viewed' and e.occurred_at >= bounds.current_start and e.occurred_at < bounds.current_end
      group by e.event_data->>'resourceId' order by total desc, id asc nulls first limit 5
  ), completed_totals as (
    select e.event_data->>'segmentId' id, count(*)::bigint total, max(s.title) title
      from public.analytics_events e left join public.segments s on s.id::text = e.event_data->>'segmentId'
      cross join bounds where e.event_type = 'reading_completed'
      and e.occurred_at >= bounds.current_start and e.occurred_at < bounds.current_end
      group by e.event_data->>'segmentId' order by total desc, id asc nulls first limit 5
  ), shared_totals as (
    select e.event_data->>'entityId' id, count(*)::bigint total, max(s.title) title
      from public.analytics_events e left join public.segments s on s.id::text = e.event_data->>'entityId'
      cross join bounds where e.event_type = 'content_shared' and e.event_data->>'entityType' = 'segment'
      and e.occurred_at >= bounds.current_start and e.occurred_at < bounds.current_end
      group by e.event_data->>'entityId' order by total desc, id asc nulls first limit 5
  )
  select jsonb_build_object(
    'announcements', coalesce((select jsonb_agg(row_to_json(x) order by x.total desc, x.id asc nulls first) from announcement_totals x), '[]'::jsonb),
    'videos', coalesce((select jsonb_agg(row_to_json(x) order by x.total desc, x.id asc nulls first) from video_totals x), '[]'::jsonb),
    'resources', coalesce((select jsonb_agg(row_to_json(x) order by x.total desc, x.id asc nulls first) from resource_totals x), '[]'::jsonb),
    'segmentsCompleted', coalesce((select jsonb_agg(row_to_json(x) order by x.total desc, x.id asc nulls first) from completed_totals x), '[]'::jsonb),
    'segmentsShared', coalesce((select jsonb_agg(row_to_json(x) order by x.total desc, x.id asc nulls first) from shared_totals x), '[]'::jsonb)
  );
$$;

comment on function public.get_analytics_rankings(text, timestamptz, text) is
  'Administrative content rankings with persisted announcement and segment titles where available.';
revoke execute on function public.get_analytics_rankings(text, timestamptz, text) from public, anon;
grant execute on function public.get_analytics_rankings(text, timestamptz, text) to authenticated;
