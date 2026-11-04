-- API-225: privacy-preserving administrative audience distribution.
create or replace function public.get_analytics_audience_distribution(p_start timestamptz, p_end timestamptz)
returns jsonb language plpgsql stable security invoker as $$
declare
  total_devices bigint; android_devices bigint; ios_devices bigint; other_devices bigint;
  standalone_devices bigint; browser_devices bigint;
begin
  if (select auth.jwt() -> 'app_metadata' ->> 'role') is distinct from 'admin' then
    raise exception 'insufficient privilege';
  end if;
  if p_start is null or p_end is null or p_start >= p_end then
    raise exception 'invalid period';
  end if;
  with latest_device_events as (
    select distinct on (anonymous_id) anonymous_id, operating_system, display_mode
    from public.analytics_events
    where occurred_at >= p_start and occurred_at < p_end
    order by anonymous_id, occurred_at desc, id desc
  )
  select count(*)::bigint,
    count(*) filter (where operating_system = 'android')::bigint,
    count(*) filter (where operating_system = 'ios')::bigint,
    count(*) filter (where operating_system = 'other')::bigint,
    count(*) filter (where display_mode = 'standalone')::bigint,
    count(*) filter (where display_mode = 'browser')::bigint
  into total_devices, android_devices, ios_devices, other_devices,
    standalone_devices, browser_devices
  from latest_device_events;
  return jsonb_build_object(
    'total', total_devices,
    'platform', jsonb_build_object(
      'android', jsonb_build_object('total', android_devices, 'percentage', coalesce(round(android_devices * 100.0 / nullif(total_devices, 0), 4), 0)),
      'ios', jsonb_build_object('total', ios_devices, 'percentage', coalesce(round(ios_devices * 100.0 / nullif(total_devices, 0), 4), 0)),
      'other', jsonb_build_object('total', other_devices, 'percentage', coalesce(round(other_devices * 100.0 / nullif(total_devices, 0), 4), 0))
    ),
    'displayMode', jsonb_build_object(
      'standalone', jsonb_build_object('total', standalone_devices, 'percentage', coalesce(round(standalone_devices * 100.0 / nullif(total_devices, 0), 4), 0)),
      'browser', jsonb_build_object('total', browser_devices, 'percentage', coalesce(round(browser_devices * 100.0 / nullif(total_devices, 0), 4), 0))
    ),
    'location', null, 'locationStatus', 'unavailable'
  );
end;
$$;

comment on function public.get_analytics_audience_distribution(timestamptz, timestamptz) is
  'Returns distinct-device platform and display-mode aggregates for administrators; location is null until an approved source exists, and raw events are never returned.';
revoke execute on function public.get_analytics_audience_distribution(timestamptz, timestamptz) from public, anon;
grant execute on function public.get_analytics_audience_distribution(timestamptz, timestamptz) to authenticated;
