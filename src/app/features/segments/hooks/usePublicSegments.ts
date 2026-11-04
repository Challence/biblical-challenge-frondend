import { useQueries, useQuery } from '@tanstack/react-query'
import {
  getPublicSegment,
  getPublicSegmentById,
  listPublicSegments,
} from '../services/segmentService'

export function usePublicSegments() {
  return useQuery({ queryKey: ['public-segments'], queryFn: listPublicSegments })
}

export function usePublicSegment(slug: string | undefined) {
  const isLegacyId = Boolean(slug && /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(slug))
  return useQuery({
    queryKey: [isLegacyId ? 'public-segment-by-id' : 'public-segment', slug],
    queryFn: () =>
      isLegacyId ? getPublicSegmentById(slug as string) : getPublicSegment(slug as string),
    enabled: Boolean(slug),
  })
}

export function usePublicSegmentById(id: string | undefined) {
  return useQuery({
    queryKey: ['public-segment-by-id', id],
    queryFn: () => getPublicSegmentById(id as string),
    enabled: Boolean(id),
  })
}

export function usePublicSegmentDetails(segments: Array<{ id: string; slug: string }>) {
  return useQueries({
    queries: segments.map((segment) => ({
      queryKey: ['public-segment', segment.slug],
      queryFn: () => getPublicSegment(segment.slug),
    })),
  })
}
