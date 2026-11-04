-- API-270: execute in an isolated database after migrations, with an admin JWT.
select set_config('request.jwt.claims', '{"role":"authenticated","app_metadata":{"role":"admin"}}', true);
select * from public.get_push_reminder_settings();
select * from public.set_push_reminder_hour(7);
do $$ begin
  if exists (select 1 from public.push_subscriptions where active and local_hour <> 7) then
    raise exception 'active subscriptions were not recalculated';
  end if;
end $$;
select * from public.set_push_reminder_hour(8);
