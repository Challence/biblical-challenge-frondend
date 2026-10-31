import { DEFAULT_SEGMENT_COVER } from '../../../segmentStorage'
import { cn } from '@/app/shared/lib/utils'

export function SegmentCover({
  src,
  alt,
  className,
}: {
  src?: string | null
  alt: string
  className?: string
}) {
  return (
    <img
      src={src || DEFAULT_SEGMENT_COVER}
      alt={alt}
      className={cn('h-44 w-full object-cover', className)}
    />
  )
}
