-- API-250 fixture: run as the local postgres role after migrations.
begin;

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

do $$
declare result jsonb;
begin
  result := public.get_analytics_audience_distribution('day', '2026-11-03 12:00:00+00', 'UTC');
  if result ? 'total' is not true or result ? 'platform' is not true then
    raise exception 'authenticated audience aggregate is incomplete: %', result;
  end if;
end;
$$;

do $$
declare visible_rows bigint;
begin
  select count(*) into visible_rows from public.analytics_events;
  if visible_rows <> 0 then
    raise exception 'direct analytics_events read unexpectedly returned rows: %', visible_rows;
  end if;
end;
$$;

rollback;

begin;
set local role anon;
do $$
begin
  perform public.get_analytics_audience_distribution('day', '2026-11-03 12:00:00+00', 'UTC');
  raise exception 'anonymous audience aggregate unexpectedly succeeded';
exception when others then
  if sqlerrm like 'anonymous audience aggregate unexpectedly succeeded' then raise; end if;
end;
$$;
rollback;
