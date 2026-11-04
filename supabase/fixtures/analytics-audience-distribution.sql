-- API-225 fixture: run only in an isolated local database with an admin JWT.
insert into public.analytics_events
  (event_id, event_type, event_data, anonymous_id, session_id, path,
   operating_system, display_mode, locale, timezone, occurred_at)
values
  ('api225-android', 'session_started', '{}', 'api225-android-device', 'api225-s1', '/', 'android', 'browser', 'es', 'UTC', '2026-11-03 10:00:00+00'),
  ('api225-ios', 'session_started', '{}', 'api225-ios-device', 'api225-s2', '/', 'ios', 'standalone', 'es', 'UTC', '2026-11-03 10:01:00+00'),
  ('api225-other', 'session_started', '{}', 'api225-other-device', 'api225-s3', '/', 'other', 'browser', 'es', 'UTC', '2026-11-03 10:02:00+00'),
  ('api225-latest', 'session_started', '{}', 'api225-latest-device', 'api225-s4', '/', 'android', 'browser', 'es', 'UTC', '2026-11-03 10:03:00+00'),
  ('api225-latest-update', 'session_started', '{}', 'api225-latest-device', 'api225-s5', '/', 'ios', 'standalone', 'es', 'UTC', '2026-11-03 10:04:00+00');

-- Expected: total=4; platform android=1, ios=2, other=1; standalone=2,
-- browser=2; location=null and locationStatus='unavailable'.
