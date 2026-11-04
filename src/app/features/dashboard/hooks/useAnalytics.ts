import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { getAnalyticsAudienceDistribution } from '../services/analyticsAudienceService'
import { getAnalyticsRankings } from '../services/analyticsRankingsService'
import { getAnalyticsSummaryPeriod } from '../services/analyticsPeriodService'
import { getAnalyticsTimeseries } from '../services/analyticsTimeseriesService'
import type {
  AnalyticsAudienceDistribution,
  AnalyticsDataState,
  AnalyticsPeriodQuery,
  AnalyticsRankings,
  AnalyticsSummaryPeriod,
  AnalyticsTimeseries,
} from '../models/analyticsModels'

export const analyticsQueryKeys = {
  summary: (input: AnalyticsPeriodQuery) =>
    ['dashboard', 'analytics-summary', input.period, input.reference, input.timezone] as const,
  rankings: (input: AnalyticsPeriodQuery) =>
    ['dashboard', 'analytics-rankings', input.period, input.reference, input.timezone] as const,
  audience: (input: AnalyticsPeriodQuery) =>
    ['dashboard', 'analytics-audience', input.period, input.reference, input.timezone] as const,
  timeseries: (input: AnalyticsPeriodQuery) =>
    ['dashboard', 'analytics-timeseries', input.period, input.reference, input.timezone] as const,
}

function state<T>(query: UseQueryResult<T>): AnalyticsDataState<T> {
  if (query.isPending) return { status: 'loading', data: undefined }
  if (query.isError) {
    const message = query.error instanceof Error ? query.error.message.toLowerCase() : ''
    return {
      status: 'error',
      data: undefined,
      error: query.error,
      permissionDenied: message.includes('privilege') || message.includes('permission'),
    }
  }
  if (query.data && Array.isArray(query.data) && query.data.length === 0)
    return { status: 'empty', data: query.data }
  return { status: 'success', data: query.data as T }
}

export function useAnalyticsSummaryPeriod(input: AnalyticsPeriodQuery) {
  const query = useQuery({
    queryKey: analyticsQueryKeys.summary(input),
    queryFn: ({ signal }) => getAnalyticsSummaryPeriod(input, signal),
  })
  return { ...query, analyticsState: state<AnalyticsSummaryPeriod>(query) }
}

export function useAnalyticsRankings(input: AnalyticsPeriodQuery) {
  const query = useQuery({
    queryKey: analyticsQueryKeys.rankings(input),
    queryFn: ({ signal }) => getAnalyticsRankings(input, signal),
  })
  const result = state<AnalyticsRankings>(query)
  if (
    result.status === 'success' &&
    Object.values(result.data).every((items) => items.length === 0)
  )
    return { ...query, analyticsState: { status: 'empty', data: result.data } as const }
  return { ...query, analyticsState: result }
}

export function useAnalyticsAudienceDistribution(input: AnalyticsPeriodQuery) {
  const query = useQuery({
    queryKey: analyticsQueryKeys.audience(input),
    queryFn: ({ signal }) => getAnalyticsAudienceDistribution(input, signal),
  })
  const result = state<AnalyticsAudienceDistribution>(query)
  if (result.status === 'success' && result.data.total === 0)
    return { ...query, analyticsState: { status: 'empty', data: result.data } as const }
  // Location is intentionally unavailable in the RPC contract; retain the aggregate data
  // while exposing that the result is incomplete for consumers that show coverage.
  if (result.status === 'success' && result.data.locationStatus === 'unavailable') {
    return { ...query, analyticsState: { status: 'partial', data: result.data } as const }
  }
  return { ...query, analyticsState: result }
}

export function useAnalyticsTimeseries(input: AnalyticsPeriodQuery) {
  const query = useQuery({
    queryKey: analyticsQueryKeys.timeseries(input),
    queryFn: ({ signal }) => getAnalyticsTimeseries(input, signal),
  })
  const result = state<AnalyticsTimeseries>(query)
  if (result.status === 'success' && result.data.points.length === 0)
    return { ...query, analyticsState: { status: 'empty', data: result.data } as const }
  return { ...query, analyticsState: result }
}
