-- API-293: changing the reminder four minutes before the old send time must
-- select the new time, and a send at that time must schedule the next day.
do $$
declare
  rescheduled timestamptz;
  next_day timestamptz;
begin
  rescheduled := public.push_next_reminder_at(
    'UTC', 2, 15, '2026-11-04 01:56:00+00'::timestamptz
  );
  next_day := public.push_next_reminder_at(
    'UTC', 2, 15, '2026-11-04 02:15:00+00'::timestamptz
  );

  if rescheduled <> '2026-11-04 02:15:00+00'::timestamptz then
    raise exception 'rescheduled reminder selected % instead of 2026-11-04 02:15 UTC', rescheduled;
  end if;
  if next_day <> '2026-11-05 02:15:00+00'::timestamptz then
    raise exception 'next reminder selected % instead of 2026-11-05 02:15 UTC', next_day;
  end if;
end;
$$;
