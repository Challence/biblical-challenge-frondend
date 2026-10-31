create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  description text not null default '',
  image_path text,
  href text not null check (href ~ '^/' or href ~* '^https://'),
  active boolean not null default false,
  position integer not null default 0 check (position >= 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index announcements_active_position_idx on public.announcements(active, position);
create index announcements_title_search_idx on public.announcements using gin (to_tsvector('simple', title));
create trigger announcements_set_updated_at before update on public.announcements
for each row execute function public.set_updated_at();

alter table public.announcements enable row level security;
create policy "active announcements are public" on public.announcements for select
to anon, authenticated using (active = true);
create policy "owners read announcements" on public.announcements for select
to authenticated using ((select auth.uid()) = created_by);
create policy "owners manage announcements" on public.announcements for all
to authenticated using ((select auth.uid()) = created_by)
with check ((select auth.uid()) = created_by);

insert into storage.buckets (id, name, public) values ('announcement-assets', 'announcement-assets', true)
on conflict (id) do nothing;
create policy "owners upload announcement assets" on storage.objects for insert to authenticated
with check (bucket_id = 'announcement-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "owners read announcement assets" on storage.objects for select to authenticated
using (bucket_id = 'announcement-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "owners update announcement assets" on storage.objects for update to authenticated
using (bucket_id = 'announcement-assets' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'announcement-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "owners delete announcement assets" on storage.objects for delete to authenticated
using (bucket_id = 'announcement-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
