export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year'

export type AnalyticsPeriodQuery = {
  period: AnalyticsPeriod
  reference: string
  timezone: string
}

export type AnalyticsMetric = {
  activeDevices: number
  sessions: number
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

export type AnalyticsPeriodBucket = {
  start: string
  end: string
  metrics: AnalyticsMetric
}

export type AnalyticsSummaryPeriod = {
  period: AnalyticsPeriod
  timezone: string
  reference: string
  current: AnalyticsPeriodBucket
  previous: AnalyticsPeriodBucket
}

export type AnalyticsTimeseriesMetric = {
  activeDevices: number
  sessions: number
  completedReadings: number
  viewedResources: number
  shares: number
  videoViews: number
  announcementClicks: number
}

export type AnalyticsTimeseriesPoint = {
  start: string
  end: string
  metrics: AnalyticsTimeseriesMetric
}

export type AnalyticsTimeseries = {
  period: AnalyticsPeriod
  timezone: string
  start: string
  end: string
  points: AnalyticsTimeseriesPoint[]
}

export type AnalyticsRanking = { id: string | null; title: string | null; total: number }
export type AnalyticsRankings = {
  announcements: AnalyticsRanking[]
  videos: AnalyticsRanking[]
  resources: AnalyticsRanking[]
  segmentsCompleted: AnalyticsRanking[]
  segmentsShared: AnalyticsRanking[]
}

export type AnalyticsAudienceBucket = { total: number; percentage: number }
export type AnalyticsAudienceDistribution = {
  total: number
  platform: {
    android: AnalyticsAudienceBucket
    ios: AnalyticsAudienceBucket
    other: AnalyticsAudienceBucket
  }
  displayMode: { standalone: AnalyticsAudienceBucket; browser: AnalyticsAudienceBucket }
  location: null
  locationStatus: 'unavailable'
}

export type AnalyticsDataState<T> =
  | { status: 'loading'; data: undefined }
  | { status: 'error'; data: undefined; error: unknown; permissionDenied: boolean }
  | { status: 'empty'; data: T }
  | { status: 'partial'; data: T }
  | { status: 'success'; data: T }
