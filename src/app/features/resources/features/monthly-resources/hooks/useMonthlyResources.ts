import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as service from '../services/resourceService'

export function useMonthlyResources(monthId: string, enabled: boolean) {
  const client = useQueryClient()
  const query = useQuery({
    queryKey: ['monthly-resources', monthId],
    queryFn: () => service.listMonthlyResources(monthId),
    enabled,
  })
  const invalidate = () =>
    void Promise.all([
      client.invalidateQueries({ queryKey: ['monthly-resources', monthId] }),
      client.invalidateQueries({ queryKey: ['public-resource-months'] }),
      client.invalidateQueries({ queryKey: ['public-monthly-resources'] }),
      client.invalidateQueries({ queryKey: ['public-monthly-resource'] }),
      client.invalidateQueries({ queryKey: ['public-resource-month'] }),
    ])
  const create = useMutation({
    mutationFn: (input: Parameters<typeof service.createMonthlyResource>[1]) =>
      service.createMonthlyResource(monthId, input),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: Parameters<typeof service.updateMonthlyResource>[1]
    }) => service.updateMonthlyResource(id, input),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: service.deleteMonthlyResource, onSuccess: invalidate })
  const reorder = useMutation({
    mutationFn: ({ id, position }: { id: string; position: number }) =>
      service.reorderMonthlyResource(id, position),
    onSuccess: invalidate,
  })
  return { ...query, create, update, remove, reorder }
}
