import { supabase } from '@/app/shared/lib/supabase'
import type { AnalyticsPeriodQuery, AnalyticsSummaryPeriod } from '../models/analyticsModels'

export async function getAnalyticsSummaryPeriod(
  query: AnalyticsPeriodQuery,
  signal?: AbortSignal,
): Promise<AnalyticsSummaryPeriod> {
  if (!supabase) throw new Error('Supabase no está configurado.')
  const request = supabase
    .rpc('get_analytics_summary_period', {
      p_period: query.period,
      p_reference: query.reference,
      p_timezone: query.timezone,
    })
    .abortSignal(signal ?? new AbortController().signal)
  const { data, error } = await request
  if (error) throw error
  return data as AnalyticsSummaryPeriod
}
