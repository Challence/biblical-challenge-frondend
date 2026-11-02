create type public.monthly_resource_type as enum ('image', 'video');

create table public.resource_months (
  id uuid primary key default gen_random_uuid(),
  month_date date not null,
  position integer not null default 0 check (position >= 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resource_months_first_day check (month_date = date_trunc('month', month_date)::date),
  constraint resource_months_month_unique unique (month_date),
  constraint resource_months_position_unique unique (position) deferrable initially immediate
);

create table public.monthly_resources (
  id uuid primary key default gen_random_uuid(),
  resource_month_id uuid not null references public.resource_months(id) on delete cascade,
  type public.monthly_resource_type not null,
  image_path text,
  video_url text,
  position integer not null default 0 check (position >= 0),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_resources_source_by_type check (
    (type = 'image' and image_path is not null and length(trim(image_path)) > 0 and video_url is null)
    or (type = 'video' and video_url ~* '^https://[^[:space:]]+$' and image_path is null)
  ),
  constraint monthly_resources_position_unique unique (resource_month_id, position) deferrable initially immediate
);

create index resource_months_position_idx on public.resource_months(position);
create index monthly_resources_month_position_idx on public.monthly_resources(resource_month_id, position);
create index monthly_resources_type_idx on public.monthly_resources(type);

create trigger resource_months_set_updated_at before update on public.resource_months
for each row execute function public.set_updated_at();
create trigger monthly_resources_set_updated_at before update on public.monthly_resources
for each row execute function public.set_updated_at();

alter table public.resource_months enable row level security;
alter table public.monthly_resources enable row level security;

create policy "resource months are public" on public.resource_months for select
to anon, authenticated using (true);
create policy "owners manage resource months" on public.resource_months for all
to authenticated using ((select auth.uid()) = created_by)
with check ((select auth.uid()) = created_by);

create policy "monthly resources are public" on public.monthly_resources for select
to anon, authenticated using (true);
create policy "owners read monthly resources" on public.monthly_resources for select
to authenticated using (exists (select 1 from public.resource_months m where m.id = resource_month_id and m.created_by = (select auth.uid())));
create policy "owners manage monthly resources" on public.monthly_resources for all
to authenticated using ((select auth.uid()) = created_by and exists (select 1 from public.resource_months m where m.id = resource_month_id and m.created_by = (select auth.uid())))
with check ((select auth.uid()) = created_by and exists (select 1 from public.resource_months m where m.id = resource_month_id and m.created_by = (select auth.uid())));

insert into storage.buckets (id, name, public)
values ('resource-assets', 'resource-assets', true)
on conflict (id) do nothing;

create policy "owners upload resource assets" on storage.objects for insert to authenticated
with check (bucket_id = 'resource-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "owners read resource assets" on storage.objects for select to authenticated
using (bucket_id = 'resource-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "owners update resource assets" on storage.objects for update to authenticated
using (bucket_id = 'resource-assets' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'resource-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "owners delete resource assets" on storage.objects for delete to authenticated
using (bucket_id = 'resource-assets' and (storage.foldername(name))[1] = (select auth.uid())::text);

create or replace function public.reorder_resource_month(p_month_id uuid, p_position integer)
returns void language plpgsql security invoker set search_path = public as $$
declare old_position integer; owner_id uuid;
begin
  if p_position < 0 then raise exception 'position must be non-negative'; end if;
  select position, created_by into old_position, owner_id from resource_months where id = p_month_id for update;
  if owner_id is null or owner_id <> (select auth.uid()) then raise exception 'not authorized'; end if;
  set constraints resource_months_position_unique deferred;
  if p_position < old_position then
    update resource_months set position = position + 1 where created_by = owner_id and position >= p_position and position < old_position;
  elsif p_position > old_position then
    update resource_months set position = position - 1 where created_by = owner_id and position > old_position and position <= p_position;
  end if;
  update resource_months set position = p_position where id = p_month_id;
end; $$;

create or replace function public.reorder_monthly_resource(p_resource_id uuid, p_position integer)
returns void language plpgsql security invoker set search_path = public as $$
declare owner_id uuid; month_id uuid; old_position integer;
begin
  if p_position < 0 then raise exception 'position must be non-negative'; end if;
  select m.created_by, r.resource_month_id into owner_id, month_id from monthly_resources r join resource_months m on m.id = r.resource_month_id where r.id = p_resource_id for update;
  if owner_id is null or owner_id <> (select auth.uid()) then raise exception 'not authorized'; end if;
  set constraints monthly_resources_position_unique deferred;
  select position into old_position from monthly_resources where id = p_resource_id;
  if p_position < old_position then
    update monthly_resources set position = position + 1 where resource_month_id = month_id and position >= p_position and position < old_position;
  elsif p_position > old_position then
    update monthly_resources set position = position - 1 where resource_month_id = month_id and position > old_position and position <= p_position;
  end if;
  update monthly_resources set position = p_position where id = p_resource_id;
end; $$;

revoke execute on function public.reorder_resource_month(uuid, integer) from public, anon;
revoke execute on function public.reorder_monthly_resource(uuid, integer) from public, anon;
grant execute on function public.reorder_resource_month(uuid, integer) to authenticated;
grant execute on function public.reorder_monthly_resource(uuid, integer) to authenticated;
