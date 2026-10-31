alter table public.segments add column position integer;

with ranked as (
  select id, row_number() over (order by year desc, month desc, id) - 1 as position
  from public.segments
)
update public.segments s
set position = ranked.position
from ranked
where s.id = ranked.id;

alter table public.segments alter column position set not null;
alter table public.segments add constraint segments_position_non_negative check (position >= 0);
create index segments_position_idx on public.segments(position, id);

create or replace function public.set_segment_position() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.position is null then
    perform pg_advisory_xact_lock(hashtext('segments_position'));
    select coalesce(max(position) + 1, 0) into new.position from public.segments;
  end if;
  return new;
end;
$$;

create trigger segments_set_position before insert on public.segments
for each row execute function public.set_segment_position();

create or replace function public.reorder_segments(
  first_id uuid,
  first_position integer,
  second_id uuid,
  second_position integer
) returns void
language plpgsql security invoker set search_path = public as $$
begin
  if first_id = second_id or first_position < 0 or second_position < 0
    or abs(first_position - second_position) <> 1 then
    raise exception 'Only neighboring segments can be reordered';
  end if;
  if not exists (select 1 from public.segments where id = first_id and position = first_position)
    or not exists (select 1 from public.segments where id = second_id and position = second_position) then
    raise exception 'Segment positions are stale';
  end if;
  if not exists (select 1 from public.segments where id = first_id and created_by = auth.uid())
    or not exists (select 1 from public.segments where id = second_id and created_by = auth.uid()) then
    raise exception 'Not authorized to reorder these segments';
  end if;
  update public.segments
  set position = case id when first_id then second_position when second_id then first_position end
  where id in (first_id, second_id);
end;
$$;
