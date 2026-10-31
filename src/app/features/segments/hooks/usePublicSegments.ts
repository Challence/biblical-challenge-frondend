import { useQuery } from '@tanstack/react-query'
import { getPublicSegment, listPublicSegments } from '../services/segmentService'

export function usePublicSegments() {
  return useQuery({ queryKey: ['public-segments'], queryFn: listPublicSegments })
}

export function usePublicSegment(id: string | undefined) {
  return useQuery({ queryKey: ['public-segment', id], queryFn: () => getPublicSegment(id as string), enabled: Boolean(id) })
}
