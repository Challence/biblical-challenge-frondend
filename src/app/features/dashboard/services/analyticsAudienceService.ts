import { supabase } from '@/app/shared/lib/supabase'
import type { AnalyticsAudienceDistribution, AnalyticsPeriodQuery } from '../models/analyticsModels'

export async function getAnalyticsAudienceDistribution(
  query: AnalyticsPeriodQuery,
  signal?: AbortSignal,
): Promise<AnalyticsAudienceDistribution> {
  if (!supabase) throw new Error('Supabase no está configurado.')
  const request = supabase
    .rpc('get_analytics_audience_distribution', {
      p_period: query.period,
      p_reference: query.reference,
      p_timezone: query.timezone,
    })
    .abortSignal(signal ?? new AbortController().signal)
  const { data, error } = await request
  if (error) throw error
  return data as AnalyticsAudienceDistribution
}
