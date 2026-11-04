-- API-223 fixture: run only in an isolated local database with an admin JWT.
-- The event timestamps deliberately sit on exclusive boundaries and a DST jump.
insert into public.analytics_events
  (event_id, event_type, event_data, anonymous_id, session_id, path,
   operating_system, display_mode, locale, timezone, occurred_at)
values
  ('api223-current-boundary', 'session_started', '{}', 'device-current', 'session-current', '/', 'ios', 'browser', 'es', 'America/New_York', '2026-03-08 00:00:00-05'),
  ('api223-current-dst', 'reading_completed', '{"segmentId":"fixture-segment","day":1}', 'device-current', 'session-current', '/', 'ios', 'browser', 'es', 'America/New_York', '2026-03-08 03:00:00-04'),
  ('api223-previous', 'content_shared', '{"entityType":"segment","entityId":"fixture-segment","method":"clipboard"}', 'device-previous', 'session-previous', '/', 'android', 'standalone', 'es', 'America/New_York', '2026-03-07 12:00:00-05');

-- Expected for reference 2026-03-08T12:00:00Z, timezone America/New_York,
-- period day: current [2026-03-08 00:00 -05, 2026-03-09 00:00 -04),
-- previous [2026-03-07 00:00 -05, 2026-03-08 00:00 -05). The boundary row
-- belongs to current, and current.metrics exposes aggregates only.
