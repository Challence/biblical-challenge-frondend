create policy "authenticated users can read push reminder settings"
on public.push_reminder_settings
for select
to authenticated
using (true);
