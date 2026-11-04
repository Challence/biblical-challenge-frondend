-- Dashboard analytics fixture. Run after migrations in a local database.
begin;
insert into public.analytics_events
  (event_id, event_type, event_data, anonymous_id, session_id, path,
   operating_system, display_mode, locale, timezone, occurred_at)
values
  ('api-dashboard-series-1', 'session_started', '{}', 'api-series-device', 'api-series-session', '/', 'ios', 'browser', 'es', 'UTC', '2026-03-08 05:10:00+00'),
  ('api-dashboard-series-2', 'announcement_clicked', '{"announcementId":"missing-title"}', 'api-series-device', 'api-series-session', '/', 'ios', 'browser', 'es', 'UTC', '2026-03-08 05:20:00+00');

select set_config('request.jwt.claims', '{"role":"authenticated","app_metadata":{"role":"admin"}}', true);
do $$
declare result jsonb;
begin
  result := public.get_analytics_timeseries('day', '2026-03-08 12:00:00+00', 'UTC');
  if jsonb_array_length(result->'points') <> 24
     or (result->'points'->0->'metrics'->>'activeDevices') <> '0' then
    raise exception 'unexpected time series: %', result;
  end if;
  result := public.get_analytics_rankings('day', '2026-03-08 12:00:00+00', 'UTC');
  if result->'announcements'->0->>'id' <> 'missing-title'
     or result->'announcements'->0->>'title' is not null then
    raise exception 'unexpected ranking enrichment: %', result;
  end if;
end;
$$;

select set_config('request.jwt.claims', '{"role":"authenticated","app_metadata":{}}', true);
do $$
begin
  begin
    perform public.get_analytics_timeseries('day', '2026-03-08 12:00:00+00', 'UTC');
    raise exception 'non-admin caller unexpectedly read time series';
  exception when others then
    if sqlerrm <> 'insufficient privilege' then raise; end if;
  end;
end;
$$;
rollback;
