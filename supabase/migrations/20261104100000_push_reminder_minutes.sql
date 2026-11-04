-- API-288: persist the complete local reminder time and recalculate schedules.
alter table public.push_reminder_settings
  add column if not exists reminder_minute smallint not null default 0
  check (reminder_minute between 0 and 59);

alter table public.push_subscriptions
  add column if not exists local_minute smallint not null default 0
  check (local_minute between 0 and 59);

create or replace function public.push_next_reminder_at(
  p_timezone text, p_hour smallint, p_minute smallint, p_now timestamptz default now()
) returns timestamptz
language plpgsql stable security definer set search_path = public, extensions
as $$
declare local_date date; candidate timestamptz;
begin
  if p_timezone is null or not exists (select 1 from pg_timezone_names where name = p_timezone)
     or p_hour is null or p_hour not between 0 and 23
     or p_minute is null or p_minute not between 0 and 59 then
    raise exception 'invalid reminder schedule';
  end if;
  local_date := (p_now at time zone p_timezone)::date;
  candidate := ((local_date::timestamp + make_interval(hours => p_hour, mins => p_minute)) at time zone p_timezone);
  if candidate <= p_now then
    candidate := (((local_date + 1)::timestamp + make_interval(hours => p_hour, mins => p_minute)) at time zone p_timezone);
  end if;
  return candidate;
end;
$$;

drop function public.get_push_reminder_settings();
create or replace function public.get_push_reminder_settings()
returns table (reminder_hour smallint, reminder_minute smallint, reminder_time text)
language plpgsql stable security invoker
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required';
  end if;
  return query select s.reminder_hour, s.reminder_minute,
    lpad(s.reminder_hour::text, 2, '0') || ':' || lpad(s.reminder_minute::text, 2, '0')
    from public.push_reminder_settings s where s.id;
end; $$;

create or replace function public.set_push_reminder_time(p_reminder_time text)
returns table (reminder_time text, updated_subscriptions integer)
language plpgsql security definer set search_path = public, extensions
as $$
declare h smallint; m smallint; changed integer;
begin
  if p_reminder_time is null or p_reminder_time !~ '^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$' then
    raise exception 'reminder time must use HH:mm';
  end if;
  h := split_part(p_reminder_time, ':', 1)::smallint;
  m := split_part(p_reminder_time, ':', 2)::smallint;
  if (select auth.uid()) is null then raise exception 'authentication required'; end if;
  update public.push_reminder_settings set reminder_hour = h, reminder_minute = m, updated_at = now() where id;
  update public.push_subscriptions set local_hour = h, local_minute = m,
    next_send_at = public.push_next_reminder_at(timezone, h, m), claimed_at = null where active;
  get diagnostics changed = row_count;
  return query select p_reminder_time, changed;
end; $$;

revoke all on function public.push_next_reminder_at(text, smallint, smallint, timestamptz) from public, anon, authenticated;
grant execute on function public.get_push_reminder_settings() to authenticated;
grant execute on function public.set_push_reminder_time(text) to authenticated;

update public.push_subscriptions s set local_minute = coalesce(r.reminder_minute, 0),
  next_send_at = public.push_next_reminder_at(s.timezone, s.local_hour, coalesce(r.reminder_minute, 0)::smallint), claimed_at = null
from public.push_reminder_settings r where r.id and s.active;
