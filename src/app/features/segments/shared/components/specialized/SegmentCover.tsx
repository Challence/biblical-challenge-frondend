import { DEFAULT_SEGMENT_COVER } from '../../../segmentStorage'

export function SegmentCover({ src, alt }: { src?: string | null; alt: string }) {
  return <img src={src || DEFAULT_SEGMENT_COVER} alt={alt} className="h-44 w-full object-cover" />
}
