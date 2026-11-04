do $$
begin
  if to_regclass('public.push_reminder_settings') is not null then
    execute 'create policy "authenticated users can read push reminder settings"
      on public.push_reminder_settings for select to authenticated using (true)';
  end if;
end
$$;
