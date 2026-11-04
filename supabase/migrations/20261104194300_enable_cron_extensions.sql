-- API-295: enable extensions required before configuring the reminder cron.
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
