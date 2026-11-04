-- API-250: expose audience aggregates to signed-in users without exposing raw events.
-- Keep the historical (timestamptz, timestamptz) overload administrative.

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.get_authenticated_audience_distribution(
  p_start timestamptz,
  p_end timestamptz
) returns jsonb
language plpgsql
stable
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  total_devices bigint;
  android_devices bigint;
  ios_devices bigint;
  other_devices bigint;
  standalone_devices bigint;
  browser_devices bigint;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
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

revoke all on function private.get_authenticated_audience_distribution(timestamptz, timestamptz) from public;
grant execute on function private.get_authenticated_audience_distribution(timestamptz, timestamptz) to authenticated;

create or replace function public.get_analytics_audience_distribution(
  p_period text,
  p_reference timestamptz,
  p_timezone text
) returns jsonb
language sql
stable
security invoker
as $$
  select private.get_authenticated_audience_distribution(bounds.current_start, bounds.current_end)
  from public.get_analytics_period_bounds(p_period, p_reference, p_timezone) as bounds;
$$;

revoke execute on function public.get_analytics_audience_distribution(text, timestamptz, text) from public, anon;
grant execute on function public.get_analytics_audience_distribution(text, timestamptz, text) to authenticated;
