export type AnalyticsEvent =
  | { type: 'session_started' }
  | { type: 'page_viewed'; path: string }
  | { type: 'announcement_clicked'; announcementId: string }
  | { type: 'reading_completed'; segmentId: string; day: number }
  | { type: 'video_viewed'; resourceId: string; watchedSeconds: number }
  | { type: 'resource_viewed'; resourceId: string; resourceType: 'image' | 'video' }
  | {
      type: 'content_shared'
      entityType: 'segment' | 'reading' | 'resource' | 'announcement'
      entityId: string
      method: 'native' | 'clipboard'
    }
  | { type: 'segment_viewed'; segmentId: string }
  | { type: 'pwa_installed'; source: 'appinstalled' | 'standalone' }

export type AnalyticsContext = {
  anonymousId: string
  sessionId: string
  path: string
  os: 'android' | 'ios' | 'other'
  displayMode: 'standalone' | 'browser'
  locale: string
  timezone: string
}

export type AnalyticsPayload = {
  eventId: string
  event: AnalyticsEvent
  context: AnalyticsContext
  occurredAt: string
}
