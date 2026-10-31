import { PublicAnnouncementCarousel } from '@/app/features/announcements/public/PublicAnnouncementCarousel'
import { PublicSegmentListPage } from '../segments/pages/public/PublicSegmentListPage'

export function GuidePage() {
  return (
    <main
      className="mx-auto w-full max-w-6xl px-1 pb-6 sm:px-8 sm:pb-5"
      aria-labelledby="guide-title"
    >
      <PublicAnnouncementCarousel />
      <PublicSegmentListPage />
    </main>
  )
}
