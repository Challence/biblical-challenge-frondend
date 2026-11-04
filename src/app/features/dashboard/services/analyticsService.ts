import { supabase } from '@/app/shared/lib/supabase'

export type AnalyticsSummary = {
  activeDevices: number
  completedReadings: number
  viewedResources: number
  shares: number
  installations: number
  videoViews: number
  announcementClicks: number
  androidUsers: number
  iosUsers: number
  browserUsers: number
  installedUsers: number
}

export async function getAnalyticsSummary(start: string, end: string): Promise<AnalyticsSummary> {
  if (!supabase) throw new Error('Supabase no está configurado.')
  const { data, error } = await supabase.rpc('get_analytics_summary', {
    p_start: start,
    p_end: end,
  })
  if (error) throw error
  return data as AnalyticsSummary
}
