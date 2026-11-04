-- Configuration is available to every authenticated user who can reach the admin UI.
create or replace function public.get_push_reminder_settings()
returns table (reminder_hour smallint)
language plpgsql stable security invoker
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required';
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
  if (select auth.uid()) is null then
    raise exception 'authentication required';
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
