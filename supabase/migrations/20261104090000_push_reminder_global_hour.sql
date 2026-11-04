-- API-270: one administrative reminder hour, interpreted in each subscription timezone.
create table public.push_reminder_settings (
  id boolean primary key default true check (id),
  reminder_hour smallint not null default 8 check (reminder_hour between 0 and 23),
  updated_at timestamptz not null default now()
);

insert into public.push_reminder_settings (id, reminder_hour) values (true, 8);
alter table public.push_reminder_settings enable row level security;
revoke all on public.push_reminder_settings from anon, authenticated;
grant select, update on public.push_reminder_settings to service_role;

create or replace function public.push_next_reminder_at(
  p_timezone text, p_hour smallint, p_now timestamptz default now()
) returns timestamptz
language plpgsql stable security definer set search_path = public, extensions
as $$
declare
  local_date date;
  candidate timestamptz;
begin
  if p_timezone is null or not exists (select 1 from pg_timezone_names where name = p_timezone)
     or p_hour is null or p_hour not between 0 and 23 then
    raise exception 'invalid reminder schedule';
  end if;
  local_date := (p_now at time zone p_timezone)::date;
  candidate := ((local_date::timestamp + make_interval(hours => p_hour)) at time zone p_timezone);
  if candidate <= p_now then
    candidate := (((local_date + 1)::timestamp + make_interval(hours => p_hour)) at time zone p_timezone);
  end if;
  return candidate;
end;
$$;

create or replace function public.get_push_reminder_settings()
returns table (reminder_hour smallint)
language plpgsql stable security invoker
as $$
begin
  if (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'insufficient privilege';
  end if;
  return query select s.reminder_hour from public.push_reminder_settings s where s.id;
end;
$$;

create or replace function public.set_push_reminder_hour(p_reminder_hour smallint)
returns table (reminder_hour smallint, updated_subscriptions integer)
language plpgsql security definer set search_path = public, extensions
as $$
declare
  changed integer;
begin
  if (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'insufficient privilege';
  end if;
  if p_reminder_hour is null or p_reminder_hour not between 0 and 23 then
    raise exception 'reminder hour must be between 0 and 23';
  end if;
  update public.push_reminder_settings
    set reminder_hour = p_reminder_hour, updated_at = now() where id;
  update public.push_subscriptions
    set local_hour = p_reminder_hour,
        next_send_at = public.push_next_reminder_at(timezone, p_reminder_hour),
        claimed_at = null
    where active;
  get diagnostics changed = row_count;
  return query select p_reminder_hour, changed;
end;
$$;

revoke all on function public.push_next_reminder_at(text, smallint, timestamptz) from public, anon, authenticated;
revoke all on function public.get_push_reminder_settings() from public, anon, authenticated;
revoke all on function public.set_push_reminder_hour(smallint) from public, anon, authenticated;
grant execute on function public.get_push_reminder_settings() to authenticated;
grant execute on function public.set_push_reminder_hour(smallint) to authenticated;
