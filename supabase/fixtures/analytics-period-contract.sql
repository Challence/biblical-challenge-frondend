-- API-231 fixture: execute in an isolated local database. It verifies that all
-- period-based aggregates share [start, end) bounds, including a DST boundary.
begin;

insert into public.analytics_events
  (event_id, event_type, event_data, anonymous_id, session_id, path,
   operating_system, display_mode, locale, timezone, occurred_at)
values
  ('api231-before', 'announcement_clicked', '{"announcementId":"before"}', 'api231-before', 'api231-s-before', '/', 'ios', 'browser', 'es', 'America/New_York', '2026-03-08 04:59:59+00'),
  ('api231-start', 'announcement_clicked', '{"announcementId":"current"}', 'api231-current', 'api231-s-current', '/', 'ios', 'browser', 'es', 'America/New_York', '2026-03-08 05:00:00+00'),
  ('api231-end', 'announcement_clicked', '{"announcementId":"after"}', 'api231-after', 'api231-s-after', '/', 'android', 'standalone', 'es', 'America/New_York', '2026-03-09 04:00:00+00');

select set_config('request.jwt.claims', '{"role":"authenticated","app_metadata":{}}', true);

do $$
declare
  bounds record;
  summary jsonb;
  rankings jsonb;
  audience jsonb;
begin
  select * into bounds from public.get_analytics_period_bounds('day', '2026-03-08 12:00:00+00', 'America/New_York');
  if bounds.current_start <> '2026-03-08 05:00:00+00'::timestamptz
     or bounds.current_end <> '2026-03-09 04:00:00+00'::timestamptz then
    raise exception 'DST calendar bounds are incorrect: %, %', bounds.current_start, bounds.current_end;
  end if;

  summary := public.get_analytics_summary_period('day', '2026-03-08 12:00:00+00', 'America/New_York');
  if summary #>> '{current,metrics,announcementClicks}' <> '1'
     or summary #>> '{current,start}' <> '2026-03-08T05:00:00+00:00' then
    raise exception 'summary did not use current half-open bounds: %', summary;
  end if;

  rankings := public.get_analytics_rankings('day', '2026-03-08 12:00:00+00', 'America/New_York');
  if rankings->'announcements' <> '[{"id":"current","total":1}]'::jsonb then
    raise exception 'rankings did not use current half-open bounds: %', rankings;
  end if;

  audience := public.get_analytics_audience_distribution('day', '2026-03-08 12:00:00+00', 'America/New_York');
  if audience->>'total' <> '1' then
    raise exception 'audience did not use current half-open bounds: %', audience;
  end if;

  select * into bounds from public.get_analytics_period_bounds('week', '2026-01-01 12:00:00+00', 'UTC');
  if bounds.current_start <> '2025-12-29 00:00:00+00'::timestamptz
     or bounds.current_end <> '2026-01-05 00:00:00+00'::timestamptz then
    raise exception 'ISO week bounds are incorrect: %, %', bounds.current_start, bounds.current_end;
  end if;

  select * into bounds from public.get_analytics_period_bounds('month', '2026-01-01 12:00:00+00', 'UTC');
  if bounds.current_start <> '2026-01-01 00:00:00+00'::timestamptz
     or bounds.previous_start <> '2025-12-01 00:00:00+00'::timestamptz then
    raise exception 'month bounds are incorrect: %, %', bounds.current_start, bounds.previous_start;
  end if;

  select * into bounds from public.get_analytics_period_bounds('year', '2026-01-01 12:00:00+00', 'UTC');
  if bounds.current_start <> '2026-01-01 00:00:00+00'::timestamptz
     or bounds.previous_start <> '2025-01-01 00:00:00+00'::timestamptz then
    raise exception 'year bounds are incorrect: %, %', bounds.current_start, bounds.previous_start;
  end if;
end;
$$;

-- Any authenticated caller can read all dashboard aggregates.
-- Anonymous callers retain no aggregate access or bounds access.
do $$
begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  begin
    perform public.get_analytics_period_bounds('day', '2026-03-08 12:00:00+00', 'America/New_York');
    raise exception 'anonymous caller unexpectedly read analytics bounds';
  exception when others then
    if sqlerrm not in ('insufficient privilege', 'permission denied for function get_analytics_period_bounds') then
      raise;
    end if;
  end;
end;
$$;

rollback;
