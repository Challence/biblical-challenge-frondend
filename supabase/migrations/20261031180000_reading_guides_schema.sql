create table public.reading_guides (
  id uuid primary key default gen_random_uuid(),
  month_date date not null,
  image_path text not null check (length(trim(image_path)) > 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reading_guides_first_day check (month_date = date_trunc('month', month_date)::date),
  constraint reading_guides_month_unique unique (month_date)
);

create index reading_guides_month_idx on public.reading_guides(month_date);
create trigger reading_guides_set_updated_at before update on public.reading_guides for each row execute function public.set_updated_at();
alter table public.reading_guides enable row level security;
create policy "owners manage reading guides" on public.reading_guides for all to authenticated
  using ((select auth.uid()) = created_by)
  with check ((select auth.uid()) = created_by);
