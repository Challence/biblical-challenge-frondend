import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAnalyticsAudienceDistribution } from '../services/analyticsAudienceService'
import { getAnalyticsRankings } from '../services/analyticsRankingsService'
import { getAnalyticsSummaryPeriod } from '../services/analyticsPeriodService'
import { getAnalyticsTimeseries } from '../services/analyticsTimeseriesService'
import type { AnalyticsPeriodQuery } from '../models/analyticsModels'
import {
  analyticsQueryKeys,
  useAnalyticsAudienceDistribution,
  useAnalyticsRankings,
  useAnalyticsSummaryPeriod,
  useAnalyticsTimeseries,
} from './useAnalytics'

vi.mock('../services/analyticsAudienceService', () => ({
  getAnalyticsAudienceDistribution: vi.fn(),
}))
vi.mock('../services/analyticsRankingsService', () => ({ getAnalyticsRankings: vi.fn() }))
vi.mock('../services/analyticsPeriodService', () => ({ getAnalyticsSummaryPeriod: vi.fn() }))
vi.mock('../services/analyticsTimeseriesService', () => ({ getAnalyticsTimeseries: vi.fn() }))

const input = {
  period: 'week' as const,
  reference: '2026-11-03T12:00:00.000Z',
  timezone: 'America/Mexico_City',
}
const summary = {
  period: 'week' as const,
  timezone: input.timezone,
  reference: input.reference,
  current: { start: input.reference, end: input.reference, metrics: {} as never },
  previous: { start: input.reference, end: input.reference, metrics: {} as never },
}
const rankings = {
  announcements: [],
  videos: [],
  resources: [],
  segmentsCompleted: [],
  segmentsShared: [],
}
const audience = {
  total: 5,
  platform: {
    android: { total: 5, percentage: 100 },
    ios: { total: 0, percentage: 0 },
    other: { total: 0, percentage: 0 },
  },
  displayMode: { standalone: { total: 5, percentage: 100 }, browser: { total: 0, percentage: 0 } },
  location: null,
  locationStatus: 'unavailable' as const,
}
const timeseries = {
  period: 'week' as const,
  timezone: input.timezone,
  start: input.reference,
  end: input.reference,
  points: [],
}

function wrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client }, children)
}

beforeEach(() => vi.clearAllMocks())

describe('dashboard analytics query keys and states', () => {
  it('includes period, reference, and timezone in every key', () => {
    expect(analyticsQueryKeys.summary(input)).toEqual([
      'dashboard',
      'analytics-summary',
      'week',
      input.reference,
      input.timezone,
    ])
    expect(analyticsQueryKeys.rankings(input)).toEqual([
      'dashboard',
      'analytics-rankings',
      'week',
      input.reference,
      input.timezone,
    ])
    expect(analyticsQueryKeys.audience(input)).toEqual([
      'dashboard',
      'analytics-audience',
      'week',
      input.reference,
      input.timezone,
    ])
    expect(analyticsQueryKeys.timeseries(input)).toEqual([
      'dashboard',
      'analytics-timeseries',
      'week',
      input.reference,
      input.timezone,
    ])
  })

  it('reports loading, success, partial, and empty states', async () => {
    vi.mocked(getAnalyticsSummaryPeriod).mockResolvedValue(summary)
    vi.mocked(getAnalyticsRankings).mockResolvedValue(rankings)
    vi.mocked(getAnalyticsAudienceDistribution).mockResolvedValue(audience)
    vi.mocked(getAnalyticsTimeseries).mockResolvedValue(timeseries)
    const summaryHook = renderHook(() => useAnalyticsSummaryPeriod(input), { wrapper: wrapper() })
    expect(summaryHook.result.current.analyticsState.status).toBe('loading')
    await waitFor(() => expect(summaryHook.result.current.analyticsState.status).toBe('success'))
    const rankingsHook = renderHook(() => useAnalyticsRankings(input), { wrapper: wrapper() })
    await waitFor(() => expect(rankingsHook.result.current.analyticsState.status).toBe('empty'))
    const audienceHook = renderHook(() => useAnalyticsAudienceDistribution(input), {
      wrapper: wrapper(),
    })
    const timeseriesHook = renderHook(() => useAnalyticsTimeseries(input), { wrapper: wrapper() })
    await waitFor(() => expect(audienceHook.result.current.analyticsState.status).toBe('partial'))
    await waitFor(() => expect(timeseriesHook.result.current.analyticsState.status).toBe('empty'))
  })

  it('reports permission errors and passes cancellation signals to services', async () => {
    vi.mocked(getAnalyticsSummaryPeriod).mockRejectedValue(new Error('insufficient privilege'))
    const hook = renderHook(() => useAnalyticsSummaryPeriod(input), { wrapper: wrapper() })
    await waitFor(() => expect(hook.result.current.analyticsState.status).toBe('error'))
    expect(hook.result.current.analyticsState).toMatchObject({ permissionDenied: true })
    expect(vi.mocked(getAnalyticsSummaryPeriod).mock.calls[0][1]).toBeInstanceOf(AbortSignal)
  })

  it('passes the complete period query and cancellation signal to rankings and audience services', async () => {
    vi.mocked(getAnalyticsRankings).mockResolvedValue(rankings)
    vi.mocked(getAnalyticsAudienceDistribution).mockResolvedValue(audience)

    const rankingsHook = renderHook(() => useAnalyticsRankings(input), { wrapper: wrapper() })
    const audienceHook = renderHook(() => useAnalyticsAudienceDistribution(input), {
      wrapper: wrapper(),
    })

    await waitFor(() => expect(rankingsHook.result.current.analyticsState.status).toBe('empty'))
    await waitFor(() => expect(audienceHook.result.current.analyticsState.status).toBe('partial'))
    expect(vi.mocked(getAnalyticsRankings)).toHaveBeenCalledWith(input, expect.any(AbortSignal))
    expect(vi.mocked(getAnalyticsAudienceDistribution)).toHaveBeenCalledWith(
      input,
      expect.any(AbortSignal),
    )
  })

  it('passes the complete period query and cancellation signal to time series', async () => {
    vi.mocked(getAnalyticsTimeseries).mockResolvedValue(timeseries)
    const hook = renderHook(() => useAnalyticsTimeseries(input), { wrapper: wrapper() })
    await waitFor(() => expect(hook.result.current.analyticsState.status).toBe('empty'))
    expect(vi.mocked(getAnalyticsTimeseries)).toHaveBeenCalledWith(input, expect.any(AbortSignal))
  })

  it('does not retain metrics from the previous period while the new period loads', async () => {
    let resolveFirst!: (value: typeof summary) => void
    const first = new Promise<typeof summary>((resolve) => {
      resolveFirst = resolve
    })
    vi.mocked(getAnalyticsSummaryPeriod)
      .mockReturnValueOnce(first)
      .mockResolvedValueOnce({ ...summary, period: 'month' as const })
    const hook = renderHook(
      ({ value }: { value: AnalyticsPeriodQuery }) => useAnalyticsSummaryPeriod(value),
      { initialProps: { value: input as AnalyticsPeriodQuery }, wrapper: wrapper() },
    )
    hook.rerender({ value: { ...input, period: 'month' } })
    await waitFor(() => expect(hook.result.current.analyticsState.status).toBe('success'))
    expect(hook.result.current.data?.period).toBe('month')
    resolveFirst(summary)
    expect(hook.result.current.data?.period).toBe('month')
  })

  it('cancels the previous rankings request when the period changes', async () => {
    let firstSignal: AbortSignal | undefined
    vi.mocked(getAnalyticsRankings)
      .mockImplementationOnce((_query, signal) => {
        firstSignal = signal
        return new Promise(() => undefined)
      })
      .mockResolvedValueOnce(rankings)

    const hook = renderHook(
      ({ value }: { value: AnalyticsPeriodQuery }) => useAnalyticsRankings(value),
      {
        initialProps: { value: input as AnalyticsPeriodQuery },
        wrapper: wrapper(),
      },
    )

    await waitFor(() => expect(firstSignal).toBeInstanceOf(AbortSignal))
    hook.rerender({ value: { ...input, period: 'month' } })
    await waitFor(() => expect(hook.result.current.analyticsState.status).toBe('empty'))
    expect(firstSignal?.aborted).toBe(true)
    expect(vi.mocked(getAnalyticsRankings)).toHaveBeenLastCalledWith(
      { ...input, period: 'month' },
      expect.any(AbortSignal),
    )
  })
})
