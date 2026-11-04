grant select on table public.reading_guides to anon, authenticated;

create policy "anyone can read reading guides" on public.reading_guides
  for select to anon, authenticated
  using (true);
