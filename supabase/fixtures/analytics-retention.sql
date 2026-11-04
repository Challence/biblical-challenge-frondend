-- API-229R fixture: run in an isolated local database after migrations.
-- It verifies the 24-month boundary, idempotence, admin authorization, and
-- the indexes used by purge and type/time analytics queries.
begin;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"role":"authenticated","app_metadata":{"role":"admin"}}',
  true
);

insert into public.analytics_events
  (event_id, event_type, event_data, anonymous_id, session_id, path,
   operating_system, display_mode, locale, timezone, occurred_at)
values
  ('api229r-expired', 'session_started', '{}', 'api229r-old', 'api229r-old', '/', 'ios', 'browser', 'es', 'UTC', now() - interval '24 months' - interval '1 second'),
  ('api229r-boundary', 'session_started', '{}', 'api229r-boundary', 'api229r-boundary', '/', 'ios', 'browser', 'es', 'UTC', now() - interval '24 months'),
  ('api229r-current', 'session_started', '{}', 'api229r-current', 'api229r-current', '/', 'ios', 'browser', 'es', 'UTC', now() - interval '1 second');

do $$
declare
  deleted_count bigint;
  second_deleted_count bigint;
  remaining_count bigint;
begin
  deleted_count := public.purge_expired_analytics_events();
  if deleted_count <> 1 then
    raise exception 'expected one expired event to be deleted, got %', deleted_count;
  end if;

  second_deleted_count := public.purge_expired_analytics_events();
  if second_deleted_count <> 0 then
    raise exception 'purge is not idempotent; second run deleted % rows', second_deleted_count;
  end if;

  select count(*) into remaining_count
  from public.analytics_events
  where event_id in ('api229r-boundary', 'api229r-current');
  if remaining_count <> 2 then
    raise exception 'events at or inside the retention boundary were not preserved';
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'analytics_events'
      and indexname = 'analytics_events_occurred_idx'
  ) then
    raise exception 'missing analytics_events_occurred_idx for purge';
  end if;
  if not exists (
    select 1 from pg_indexes
    where schemaname = 'public'
      and tablename = 'analytics_events'
      and indexname = 'analytics_events_type_occurred_idx'
  ) then
    raise exception 'missing analytics_events_type_occurred_idx for typed analytics queries';
  end if;
end;
$$;

select set_config(
  'request.jwt.claims',
  '{"role":"authenticated","app_metadata":{"role":"editor"}}',
  true
);

do $$
begin
  begin
    perform public.purge_expired_analytics_events();
    raise exception 'non-admin caller was allowed to purge events';
  exception
    when others then
      if sqlerrm <> 'insufficient privilege' then
        raise;
      end if;
  end;
end;
$$;

rollback;
