import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as service from '../services/resourceService'
import type { ResourceMonthFilters } from '../requests/resourceRequests'

export const RESOURCE_MONTH_PAGE_SIZE = 10

export function useResourceMonths(page: number, filters: ResourceMonthFilters) {
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const query = useQuery({
    queryKey: ['resource-months', page, filters],
    queryFn: () => service.listResourceMonths(page, RESOURCE_MONTH_PAGE_SIZE, filters),
  })

  const toggle = (id: string) => {
    const next = !expanded[id]
    setExpanded((current) => ({ ...current, [id]: next }))
  }
  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['resource-months'] })
  const create = useMutation({ mutationFn: service.createResourceMonth, onSuccess: invalidate })
  const update = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: Parameters<typeof service.updateResourceMonth>[1]
    }) => service.updateResourceMonth(id, input),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: service.deleteResourceMonth, onSuccess: invalidate })
  const reorder = useMutation({
    mutationFn: ({ id, position }: { id: string; position: number }) =>
      service.reorderResourceMonth(id, position),
    onSuccess: invalidate,
  })
  return { ...query, expanded, toggle, reload: query.refetch, create, update, remove, reorder }
}
