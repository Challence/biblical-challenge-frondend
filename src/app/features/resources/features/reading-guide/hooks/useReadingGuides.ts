import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as service from '../services/readingGuideService'

export function useReadingGuides(enabled = true) {
  const client = useQueryClient()
  const invalidate = () => void client.invalidateQueries({ queryKey: ['reading-guides'] })
  const query = useQuery({
    queryKey: ['reading-guides'],
    queryFn: service.listReadingGuides,
    enabled,
  })
  const create = useMutation({ mutationFn: service.createReadingGuide, onSuccess: invalidate })
  const update = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: Parameters<typeof service.updateReadingGuide>[1]
    }) => service.updateReadingGuide(id, input),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: service.deleteReadingGuide, onSuccess: invalidate })
  return { ...query, create, update, remove }
}
