create type public.segment_status as enum ('draft', 'active');
create type public.segment_block_type as enum ('text', 'image', 'video');

create table public.segments (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  month smallint not null check (month between 1 and 12),
  year smallint not null check (year between 2000 and 2200),
  cover_path text,
  status public.segment_status not null default 'draft',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.segment_days (
  id uuid primary key default gen_random_uuid(),
  segment_id uuid not null references public.segments(id) on delete cascade,
  day smallint not null check (day between 1 and 31),
  unique (segment_id, day)
);

create table public.segment_blocks (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.segment_days(id) on delete cascade,
  type public.segment_block_type not null,
  content text not null check (length(trim(content)) > 0),
  position integer not null check (position >= 0),
  file_name text,
  unique (day_id, position)
);

create index segments_status_year_month_idx on public.segments(status, year, month);
create index segments_title_search_idx on public.segments using gin (to_tsvector('simple', title));
create index segment_days_segment_id_idx on public.segment_days(segment_id);
create index segment_blocks_day_id_position_idx on public.segment_blocks(day_id, position);

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger segments_set_updated_at before update on public.segments
for each row execute function public.set_updated_at();

alter table public.segments enable row level security;
alter table public.segment_days enable row level security;
alter table public.segment_blocks enable row level security;

create policy "active segments are public" on public.segments for select
to anon, authenticated using (status = 'active');
create policy "authenticated users read segments" on public.segments for select
to authenticated using (true);
create policy "users manage own segments" on public.segments for all
to authenticated using ((select auth.uid()) = created_by)
with check ((select auth.uid()) = created_by);

create policy "public reads days of active segments" on public.segment_days for select
to anon, authenticated using (exists (select 1 from public.segments s where s.id = segment_id and s.status = 'active'));
create policy "owners manage days" on public.segment_days for all
to authenticated using (exists (select 1 from public.segments s where s.id = segment_id and s.created_by = (select auth.uid())))
with check (exists (select 1 from public.segments s where s.id = segment_id and s.created_by = (select auth.uid())));

create policy "public reads blocks of active segments" on public.segment_blocks for select
to anon, authenticated using (exists (select 1 from public.segment_days d join public.segments s on s.id = d.segment_id where d.id = day_id and s.status = 'active'));
create policy "owners manage blocks" on public.segment_blocks for all
to authenticated using (exists (select 1 from public.segment_days d join public.segments s on s.id = d.segment_id where d.id = day_id and s.created_by = (select auth.uid())))
with check (exists (select 1 from public.segment_days d join public.segments s on s.id = d.segment_id where d.id = day_id and s.created_by = (select auth.uid())));

insert into storage.buckets (id, name, public) values ('segment-assets', 'segment-assets', false)
on conflict (id) do nothing;

create policy "owners upload segment assets" on storage.objects for insert to authenticated
with check (bucket_id = 'segment-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "owners read segment assets" on storage.objects for select to authenticated
using (bucket_id = 'segment-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "owners delete segment assets" on storage.objects for delete to authenticated
using (bucket_id = 'segment-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
