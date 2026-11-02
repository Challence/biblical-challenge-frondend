import { useQuery } from '@tanstack/react-query'
import * as service from '../services/resourceService'

export const RESOURCE_MONTH_PAGE_SIZE = 10
export function usePublicResourceMonths(page: number) {
  return useQuery({
    queryKey: ['public-resource-months', page],
    queryFn: () => service.listResourceMonths(page, RESOURCE_MONTH_PAGE_SIZE),
  })
}
