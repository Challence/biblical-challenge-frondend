import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Empty } from '@/app/shared/components/empty/Empty'
import * as service from './services/resourceService'
import { PublicResourceCard } from './shared/components/specialized/PublicResourceCard'

export function PublicResourceDetailPage() {
  const { resourceId } = useParams<{ resourceId: string }>()
  const resource = useQuery({
    queryKey: ['public-monthly-resource', resourceId],
    queryFn: () => service.getMonthlyResource(resourceId ?? ''),
    enabled: Boolean(resourceId),
  })
  const month = useQuery({
    queryKey: ['public-resource-month', resource.data?.resourceMonthId],
    queryFn: () => service.getResourceMonth(resource.data?.resourceMonthId ?? ''),
    enabled: Boolean(resource.data?.resourceMonthId),
  })
  if (resource.isLoading)
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p role="status">Cargando recurso…</p>
      </main>
    )
  if (resource.error || !resource.data)
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Empty msg="No se encontró el recurso" />
      </main>
    )
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <PublicResourceCard resource={resource.data} monthDate={month.data?.monthDate} autoOpen />
    </main>
  )
}
