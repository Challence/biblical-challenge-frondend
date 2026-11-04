create table public.analytics_events (
  id bigint generated always as identity primary key,
  event_id text not null unique check (length(trim(event_id)) between 1 and 128),
  event_type text not null check (event_type in (
    'session_started',
    'page_viewed',
    'announcement_clicked',
    'reading_completed',
    'video_viewed',
    'resource_viewed',
    'content_shared',
    'segment_viewed',
    'pwa_installed'
  )),
  event_data jsonb not null default '{}'::jsonb,
  anonymous_id text not null check (length(trim(anonymous_id)) between 1 and 128),
  session_id text not null check (length(trim(session_id)) between 1 and 128),
  path text not null check (length(trim(path)) between 1 and 2048),
  operating_system text not null check (operating_system in ('android', 'ios', 'other')),
  display_mode text not null check (display_mode in ('standalone', 'browser')),
  locale text not null check (length(trim(locale)) between 2 and 128),
  timezone text not null check (length(trim(timezone)) between 1 and 128),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint analytics_events_event_data_object_check check (jsonb_typeof(event_data) = 'object'),
  constraint analytics_events_event_payload_check check (
    case event_type
      when 'session_started' then true
      when 'page_viewed' then jsonb_typeof(event_data->'path') = 'string'
        and length(trim(event_data->>'path')) between 1 and 2048
      when 'announcement_clicked' then jsonb_typeof(event_data->'announcementId') = 'string'
        and length(trim(event_data->>'announcementId')) between 1 and 256
      when 'reading_completed' then jsonb_typeof(event_data->'segmentId') = 'string'
        and length(trim(event_data->>'segmentId')) between 1 and 256
        and case when jsonb_typeof(event_data->'day') = 'number' then
          (event_data->>'day')::numeric >= 1
          and (event_data->>'day')::numeric = trunc((event_data->>'day')::numeric)
        else false end
      when 'video_viewed' then jsonb_typeof(event_data->'resourceId') = 'string'
        and length(trim(event_data->>'resourceId')) between 1 and 256
        and case when jsonb_typeof(event_data->'watchedSeconds') = 'number' then
          (event_data->>'watchedSeconds')::numeric >= 0
        else false end
      when 'resource_viewed' then jsonb_typeof(event_data->'resourceId') = 'string'
        and length(trim(event_data->>'resourceId')) between 1 and 256
        and event_data->>'resourceType' in ('image', 'video')
      when 'content_shared' then event_data->>'entityType' in ('segment', 'reading', 'resource', 'announcement')
        and jsonb_typeof(event_data->'entityId') = 'string'
        and length(trim(event_data->>'entityId')) between 1 and 256
        and event_data->>'method' in ('native', 'clipboard')
      when 'segment_viewed' then jsonb_typeof(event_data->'segmentId') = 'string'
        and length(trim(event_data->>'segmentId')) between 1 and 256
      when 'pwa_installed' then event_data->>'source' in ('appinstalled', 'standalone')
      else false
    end
  )
);

create index analytics_events_type_occurred_idx on public.analytics_events(event_type, occurred_at);
create index analytics_events_anonymous_occurred_idx on public.analytics_events(anonymous_id, occurred_at);
create index analytics_events_occurred_idx on public.analytics_events(occurred_at);

-- Raw events are retained for 24 months. Keep this index aligned with the
-- maintenance predicate so scheduled deletion does not scan the event table.

alter table public.analytics_events enable row level security;

comment on table public.analytics_events is 'Validated client analytics events; event_id provides idempotent delivery.';
comment on column public.analytics_events.event_type is 'Analytics event catalog: session_started, page_viewed, announcement_clicked, reading_completed, video_viewed, resource_viewed, content_shared, segment_viewed, pwa_installed.';

create policy "public can record analytics events" on public.analytics_events
  for insert to anon, authenticated
  with check (true);

create policy "authenticated users can read analytics events" on public.analytics_events
  for select to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "admins can delete expired analytics events" on public.analytics_events
  for delete to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

revoke all on table public.analytics_events from anon, authenticated;
grant insert on table public.analytics_events to anon, authenticated;
grant select on table public.analytics_events to authenticated;
grant delete on table public.analytics_events to authenticated;
-- DELETE is grantable only because the RLS policy below limits it to admins.

create or replace function public.purge_expired_analytics_events()
returns bigint
language plpgsql
volatile
security invoker
as $$
declare
  deleted_count bigint;
begin
  if (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'insufficient privilege';
  end if;

  delete from public.analytics_events
  where occurred_at < now() - interval '24 months';

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

comment on function public.purge_expired_analytics_events() is
  'Deletes raw analytics events older than 24 months; callable only by authenticated administrators.';

revoke execute on function public.purge_expired_analytics_events() from public, anon;
grant execute on function public.purge_expired_analytics_events() to authenticated;

create or replace function public.get_analytics_summary(
  p_start timestamptz,
  p_end timestamptz
) returns jsonb
language plpgsql
stable
security invoker
as $$
begin
  if (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'insufficient privilege';
  end if;

  return (select jsonb_build_object(
    'activeDevices', count(distinct anonymous_id) filter (where event_type = 'session_started'),
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
  )
  from public.analytics_events
  where occurred_at >= p_start and occurred_at < p_end);
end;
$$;

revoke execute on function public.get_analytics_summary(timestamptz, timestamptz) from public, anon;
grant execute on function public.get_analytics_summary(timestamptz, timestamptz) to authenticated;

create or replace function public.get_analytics_rankings(
  p_start timestamptz,
  p_end timestamptz
) returns jsonb
language plpgsql
stable
security invoker
as $$
begin
  if (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'insufficient privilege';
  end if;

  if p_start is null or p_end is null or p_start >= p_end then
    raise exception 'invalid period';
  end if;

  -- Aggregate only within the requested half-open period.  The source table is
  -- deliberately not joined to content tables: rankings remain useful after a
  -- content deletion, and no individual event payload is returned.
  return (with
    announcement_totals as (
      select event_data->>'announcementId' as id, count(*)::bigint as total
      from public.analytics_events
      where event_type = 'announcement_clicked' and occurred_at >= p_start and occurred_at < p_end
      group by event_data->>'announcementId'
      order by total desc, id asc nulls first limit 5
    ), video_totals as (
      select event_data->>'resourceId' as id, count(*)::bigint as total
      from public.analytics_events
      where event_type = 'video_viewed' and occurred_at >= p_start and occurred_at < p_end
      group by event_data->>'resourceId'
      order by total desc, id asc nulls first limit 5
    ), resource_totals as (
      select event_data->>'resourceId' as id, count(*)::bigint as total
      from public.analytics_events
      where event_type = 'resource_viewed' and occurred_at >= p_start and occurred_at < p_end
      group by event_data->>'resourceId'
      order by total desc, id asc nulls first limit 5
    ), completed_totals as (
      select event_data->>'segmentId' as id, count(*)::bigint as total
      from public.analytics_events
      where event_type = 'reading_completed' and occurred_at >= p_start and occurred_at < p_end
      group by event_data->>'segmentId'
      order by total desc, id asc nulls first limit 5
    ), shared_totals as (
      select event_data->>'entityId' as id, count(*)::bigint as total
      from public.analytics_events
      where event_type = 'content_shared' and event_data->>'entityType' = 'segment'
        and occurred_at >= p_start and occurred_at < p_end
      group by event_data->>'entityId'
      order by total desc, id asc nulls first limit 5
    )
    select jsonb_build_object(
      'announcements', coalesce((select jsonb_agg(row_to_json(item) order by item.total desc, item.id asc nulls first) from announcement_totals item), '[]'::jsonb),
      'videos', coalesce((select jsonb_agg(row_to_json(item) order by item.total desc, item.id asc nulls first) from video_totals item), '[]'::jsonb),
      'resources', coalesce((select jsonb_agg(row_to_json(item) order by item.total desc, item.id asc nulls first) from resource_totals item), '[]'::jsonb),
      'segmentsCompleted', coalesce((select jsonb_agg(row_to_json(item) order by item.total desc, item.id asc nulls first) from completed_totals item), '[]'::jsonb),
      'segmentsShared', coalesce((select jsonb_agg(row_to_json(item) order by item.total desc, item.id asc nulls first) from shared_totals item), '[]'::jsonb)
    ));
end;
$$;

revoke execute on function public.get_analytics_rankings(timestamptz, timestamptz) from public, anon;
grant execute on function public.get_analytics_rankings(timestamptz, timestamptz) to authenticated;
