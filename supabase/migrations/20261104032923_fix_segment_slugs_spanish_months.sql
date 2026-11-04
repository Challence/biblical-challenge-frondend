create or replace function public.segment_slug(title text, month smallint, year smallint)
returns text
language sql
immutable
set search_path = public
as $$
  select regexp_replace(lower(regexp_replace(unaccent(trim(title)), '[^a-zA-Z0-9]+', '-', 'g')), '(^-|-$)', '', 'g') || '-' ||
    case month
      when 1 then 'enero'
      when 2 then 'febrero'
      when 3 then 'marzo'
      when 4 then 'abril'
      when 5 then 'mayo'
      when 6 then 'junio'
      when 7 then 'julio'
      when 8 then 'agosto'
      when 9 then 'septiembre'
      when 10 then 'octubre'
      when 11 then 'noviembre'
      when 12 then 'diciembre'
    end || '-' || year::text;
$$;

do $$
begin
  if exists (
    select public.segment_slug(title, month, year)
    from public.segments
    group by public.segment_slug(title, month, year)
    having count(*) > 1
  ) then
    raise exception 'Cannot backfill segment slugs: generated Spanish-month slugs collide';
  end if;
end;
$$;

-- Stage through unique temporary values so an old slug cannot conflict with
-- another row's new slug while the unique constraint remains in place.
update public.segments
set slug = '__segment_slug_migration__' || id::text;

update public.segments
set slug = public.segment_slug(title, month, year);
