import { useQuery } from '@tanstack/react-query'
import * as service from '../../../services/resourceService'
import type { ResourceMonth } from '../../../models/resource'
import { PublicResourceCard } from './PublicResourceCard'

export function PublicResourceMonthSection({ month }: { month: ResourceMonth }) {
  const resources = useQuery({
    queryKey: ['public-monthly-resources', month.id],
    queryFn: () => service.listMonthlyResources(month.id),
  })
  const items = resources.data?.items ?? []
  const label = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(
    new Date(`${month.monthDate}T00:00:00Z`),
  )
  return (
    <section aria-labelledby={`public-month-${month.id}`} className="space-y-5">
      <div>
        <h2 id={`public-month-${month.id}`} className="text-2xl font-semibold">
          {label}
        </h2>
        {resources.isLoading ? (
          <p className="mt-1 text-muted-foreground">Cargando recursos…</p>
        ) : resources.error ? (
          <div role="alert" className="mt-1">
            <p className="text-muted-foreground">No se pudieron cargar los recursos.</p>
            <button
              type="button"
              className="text-sm font-semibold text-primary underline"
              onClick={() => void resources.refetch()}
            >
              Reintentar
            </button>
          </div>
        ) : items.length === 0 ? (
          <p className="mt-1 text-muted-foreground">Aún no hay recursos para este mes.</p>
        ) : null}
      </div>
      {items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...items]
            .sort((a, b) => a.position - b.position)
            .map((resource) => (
              <PublicResourceCard
                key={resource.id}
                resource={resource}
                monthDate={month.monthDate}
              />
            ))}
        </div>
      ) : null}
    </section>
  )
}
