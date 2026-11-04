do $$
begin
  if to_regclass('public.push_reminder_settings') is not null then
    grant select on public.push_reminder_settings to authenticated;
  end if;
end
$$;
