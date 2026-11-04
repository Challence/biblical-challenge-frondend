-- El workflow de despliegue ejecuta esta misma configuración automáticamente.
-- Ejecutar manualmente solo para una instalación inicial o recuperación.
-- Sustituye los valores antes de quitar los comentarios; nunca los guardes en Git.
-- select vault.create_secret('https://PROJECT_REF.supabase.co', 'push_project_url');
-- select vault.create_secret('A_LONG_RANDOM_SECRET', 'push_cron_secret');

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.unschedule(jobid)
from cron.job
where jobname = 'send-push-reminders';

select cron.schedule(
  'send-push-reminders',
  '* * * * *',
  $schedule$
  select net.http_post(
    url := (
      select decrypted_secret
      from vault.decrypted_secrets
      where name = 'push_project_url'
    ) || '/functions/v1/send-push-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'push_cron_secret'
      )
    ),
    body := '{}'::jsonb
  );
  $schedule$
);
