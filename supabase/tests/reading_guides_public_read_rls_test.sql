begin;
select plan(9);

insert into auth.users (id, aud, role, email)
values
  ('00000000-0000-0000-0000-000000000011', 'authenticated', 'authenticated', 'reading-owner@example.test'),
  ('00000000-0000-0000-0000-000000000022', 'authenticated', 'authenticated', 'reading-other@example.test');

insert into public.reading_guides (month_date, image_path, created_by) values
  ('2099-01-01', '/rls-owner.png', '00000000-0000-0000-0000-000000000011'),
  ('2099-02-01', '/rls-other.png', '00000000-0000-0000-0000-000000000022');

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'reading_guides'
      and policyname = 'anyone can read reading guides'
      and cmd = 'SELECT'
  ),
  'public.reading_guides has a public SELECT policy'
);
select ok(has_table_privilege('anon', 'public.reading_guides', 'SELECT'), 'anon has SELECT privilege');
select ok(has_table_privilege('authenticated', 'public.reading_guides', 'SELECT'), 'authenticated has SELECT privilege');
select ok(not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reading_guides' and 'anon' = any(roles) and cmd = 'INSERT'), 'anon has no INSERT policy');
select ok(not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reading_guides' and 'anon' = any(roles) and cmd = 'UPDATE'), 'anon has no UPDATE policy');
select ok(not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reading_guides' and 'anon' = any(roles) and cmd = 'DELETE'), 'anon has no DELETE policy');

set local role anon;
select is((select count(*) from public.reading_guides where image_path like '/rls-%'), 2::bigint, 'anon can read public guides');
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000011', true);
select is((select count(*) from public.reading_guides where image_path like '/rls-%'), 2::bigint, 'owner can read all public guides');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000033', true);
select is((select count(*) from public.reading_guides where image_path like '/rls-%'), 2::bigint, 'another user can read all public guides');
reset role;

select * from finish();
rollback;
