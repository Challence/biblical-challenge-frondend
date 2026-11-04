create extension if not exists unaccent;
alter table public.segments add column slug text;
create or replace function public.segment_slug(title text, month smallint, year smallint)
returns text language sql immutable set search_path = public as $$
  select regexp_replace(lower(regexp_replace(unaccent(trim(title)), '[^a-zA-Z0-9]+', '-', 'g')), '(^-|-$)', '', 'g') || '-' || month::text || '-' || year::text;
$$;
update public.segments set slug = public.segment_slug(title, month, year) where slug is null;
alter table public.segments alter column slug set not null;
alter table public.segments add constraint segments_slug_unique unique (slug);
create or replace function public.set_segment_slug() returns trigger language plpgsql set search_path = public as $$
begin
  if tg_op = 'INSERT' and new.slug is null then new.slug := public.segment_slug(new.title, new.month, new.year); end if;
  return new;
end;
$$;
create trigger segments_set_slug before insert on public.segments for each row execute function public.set_segment_slug();
