import { Card, CardContent } from '@/app/shared/components/ui/card'
import { SegmentCover } from './SegmentCover'
import { SEGMENT_MONTHS } from '../../../models/segmentCatalog'
import { PublicSegmentGuideDialog } from './PublicSegmentGuideDialog'

type PublicSegment = {
  id: string
  slug: string
  title: string
  month: number
  year: number
  coverPath?: string
  days: number
}
export function PublicSegmentList({ segments }: { segments: PublicSegment[] }) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {segments.map((segment) => (
        <PublicSegmentGuideDialog key={segment.id} segmentId={segment.slug}>
          <button
            type="button"
            className="w-full rounded-[var(--shape-16)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
          >
            <Card className="group h-full overflow-hidden transition-shadow hover:shadow-[var(--elevation-card-hover)]">
              <CardContent className="flex min-h-24 min-w-0 items-center gap-3 p-3 sm:gap-4 sm:p-4">
                <SegmentCover
                  src={segment.coverPath}
                  alt={`Portada de ${segment.title}`}
                  className="size-16 shrink-0 rounded-[var(--shape-8)] object-cover transition-transform group-hover:scale-[1.03] sm:size-20"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-heading text-base font-bold sm:text-lg">
                    {segment.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
                    {SEGMENT_MONTHS[segment.month - 1]} {segment.year}
                  </p>
                  <p className="mt-2 text-xs font-bold sm:text-sm">
                    {segment.days} {segment.days === 1 ? 'día' : 'días'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </button>
        </PublicSegmentGuideDialog>
      ))}
    </div>
  )
}
