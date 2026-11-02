create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  installation_id uuid not null unique,
  endpoint text not null unique check (length(endpoint) between 1 and 2048),
  p256dh text not null check (length(p256dh) between 1 and 512),
  auth text not null check (length(auth) between 1 and 512),
  unsubscribe_token_hash text not null check (length(unsubscribe_token_hash) = 64),
  timezone text not null check (length(timezone) between 1 and 100),
  local_hour smallint not null default 8 check (local_hour between 0 and 23),
  next_send_at timestamptz not null,
  last_sent_at timestamptz,
  claimed_at timestamptz,
  failure_count integer not null default 0 check (failure_count >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index push_subscriptions_due_idx
on public.push_subscriptions (next_send_at)
where active = true;

alter table public.push_subscriptions enable row level security;

revoke all on table public.push_subscriptions from anon, authenticated;
grant select, insert, update, delete on table public.push_subscriptions to service_role;

create trigger push_subscriptions_set_updated_at
before update on public.push_subscriptions
for each row execute function public.set_updated_at();
