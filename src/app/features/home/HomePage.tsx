import { PublicAnnouncementCarousel } from '@/app/features/announcements/public/PublicAnnouncementCarousel'
import { PublicReadingGuideSection } from '@/app/features/resources/features/reading-guide/shared/components/specialized/PublicReadingGuideSection'
import { PublicSegmentSection } from '@/app/features/segments/shared/components/specialized/PublicSegmentSection'

export function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-1 pb-6 sm:px-8 sm:pb-5">
      <PublicAnnouncementCarousel />
      <PublicReadingGuideSection />
      <PublicSegmentSection />
    </div>
  )
}
