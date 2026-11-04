import { describe, expect, it, vi } from 'vitest'
import { getAnalyticsAudienceDistribution } from './analyticsAudienceService'
import { getAnalyticsRankings } from './analyticsRankingsService'
import { getAnalyticsSummaryPeriod } from './analyticsPeriodService'
import { getAnalyticsTimeseries } from './analyticsTimeseriesService'

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }))
vi.mock('@/app/shared/lib/supabase', () => ({ supabase: { rpc } }))

function request(data: unknown = {}) {
  const builder = { abortSignal: vi.fn().mockResolvedValue({ data, error: null }) }
  rpc.mockReturnValue({ ...builder, abortSignal: builder.abortSignal })
  return builder
}

describe('dashboard analytics services', () => {
  it('calls the period RPC and propagates its AbortSignal', async () => {
    const builder = request({ ok: true })
    const signal = new AbortController().signal
    await getAnalyticsSummaryPeriod(
      { period: 'month', reference: '2026-11-03T00:00:00Z', timezone: 'UTC' },
      signal,
    )
    expect(rpc).toHaveBeenCalledWith('get_analytics_summary_period', {
      p_period: 'month',
      p_reference: '2026-11-03T00:00:00Z',
      p_timezone: 'UTC',
    })
    expect(builder.abortSignal).toHaveBeenCalledWith(signal)
  })

  it('calls rankings and audience RPCs with the same cancellation signal', async () => {
    const signal = new AbortController().signal
    const query = {
      period: 'week' as const,
      reference: '2026-11-03T00:00:00Z',
      timezone: 'America/Mexico_City',
    }
    const rankingsBuilder = request({ announcements: [] })
    await getAnalyticsRankings(query, signal)
    expect(rpc).toHaveBeenCalledWith('get_analytics_rankings', {
      p_period: query.period,
      p_reference: query.reference,
      p_timezone: query.timezone,
    })
    expect(rankingsBuilder.abortSignal).toHaveBeenCalledWith(signal)
    const audienceBuilder = request({ total: 0 })
    await getAnalyticsAudienceDistribution(query, signal)
    expect(rpc).toHaveBeenCalledWith('get_analytics_audience_distribution', {
      p_period: query.period,
      p_reference: query.reference,
      p_timezone: query.timezone,
    })
    expect(audienceBuilder.abortSignal).toHaveBeenCalledWith(signal)
  })

  it('calls the time series RPC with the complete period query and signal', async () => {
    const signal = new AbortController().signal
    const query = { period: 'month' as const, reference: '2026-11-03T00:00:00Z', timezone: 'UTC' }
    const builder = request({
      period: 'month',
      timezone: 'UTC',
      start: query.reference,
      end: query.reference,
      points: [],
    })
    await getAnalyticsTimeseries(query, signal)
    expect(rpc).toHaveBeenCalledWith('get_analytics_timeseries', {
      p_period: query.period,
      p_reference: query.reference,
      p_timezone: query.timezone,
    })
    expect(builder.abortSignal).toHaveBeenCalledWith(signal)
  })

  it('propagates RPC errors for permission handling by hooks', async () => {
    rpc.mockReturnValue({
      abortSignal: vi
        .fn()
        .mockResolvedValue({ data: null, error: new Error('insufficient privilege') }),
    })
    await expect(
      getAnalyticsSummaryPeriod({
        period: 'day',
        reference: '2026-11-03T00:00:00Z',
        timezone: 'UTC',
      }),
    ).rejects.toThrow('insufficient privilege')
  })
})
