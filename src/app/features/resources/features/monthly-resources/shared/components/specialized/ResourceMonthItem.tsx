import {
  IconArrowDown,
  IconArrowUp,
  IconChevronDown,
  IconChevronRight,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'
import type { ResourceMonth, MonthlyResource } from '../../../models/resource'
import { ResourceList } from './ResourceList'
import { useMonthlyResources } from '../../../hooks/useMonthlyResources'

export function ResourceMonthItem({
  month,
  expanded,
  index,
  total,
  onToggle,
  onEdit,
  onDelete,
  onMove,
  onEditResource,
  onDeleteResourceRequest,
  onCreateResource,
}: {
  month: ResourceMonth
  expanded: boolean
  index: number
  total: number
  onToggle: () => void
  onEdit?: (month: ResourceMonth) => void
  onDelete?: (month: ResourceMonth) => void
  onMove?: (month: ResourceMonth, direction: -1 | 1) => void
  onEditResource?: (resource: MonthlyResource) => void
  onDeleteResourceRequest?: (resource: MonthlyResource) => void
  onCreateResource?: (month: ResourceMonth) => void
}) {
  const resources = useMonthlyResources(month.id, expanded)
  const resourcesId = `month-resources-${month.id}`
  const label = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(
    new Date(`${month.monthDate}T00:00:00Z`),
  )
  const onDeleteResource = (resource: MonthlyResource) => onDeleteResourceRequest?.(resource)
  return (
    <div className="rounded-lg border p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          aria-label={`${expanded ? 'Contraer' : 'Expandir'} recursos de ${label}`}
          aria-expanded={expanded}
          aria-controls={resourcesId}
          onClick={onToggle}
        >
          {expanded ? (
            <IconChevronDown aria-hidden="true" />
          ) : (
            <IconChevronRight aria-hidden="true" />
          )}
        </Button>
        <button type="button" className="min-h-11 min-w-0 flex-1 text-left" onClick={onToggle}>
          <span className="font-medium capitalize">{label}</span>
          <span className="block text-sm text-muted-foreground">
            {resources.data ? `${resources.data.items.length} recursos` : 'Ver recursos'}
          </span>
        </button>
        {onCreateResource && (
          <Button variant="outline" onClick={() => onCreateResource(month)}>
            Añadir recurso
          </Button>
        )}
        {onMove && (
          <>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Subir ${label}`}
              disabled={index === 0}
              onClick={() => onMove(month, -1)}
            >
              <IconArrowUp aria-hidden="true" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Bajar ${label}`}
              disabled={index === total - 1}
              onClick={() => onMove(month, 1)}
            >
              <IconArrowDown aria-hidden="true" />
            </Button>
          </>
        )}
        {onEdit && (
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Editar ${label}`}
            onClick={() => onEdit(month)}
          >
            <IconEdit aria-hidden="true" />
          </Button>
        )}
        {onDelete && (
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Eliminar ${label}`}
            onClick={() => onDelete(month)}
          >
            <IconTrash aria-hidden="true" />
          </Button>
        )}
      </div>
      {expanded && (
        <div
          id={resourcesId}
          className="mt-2 space-y-2 border-l-2 border-muted pl-10"
          aria-label={`Recursos de ${label}`}
        >
          {resources.isLoading ? (
            <p role="status">Cargando recursos…</p>
          ) : resources.isError ? (
            <div>
              <p role="alert">No se pudieron cargar los recursos.</p>
              <Button variant="ghost" onClick={() => void resources.refetch()}>
                Reintentar
              </Button>
            </div>
          ) : resources.data?.items.length ? (
            <ResourceList
              monthDate={month.monthDate}
              resources={resources.data.items}
              onEdit={(resource) => onEditResource?.(resource)}
              onDelete={onDeleteResource}
              onMove={(resource, direction) =>
                resources.reorder.mutate({
                  id: resource.id,
                  position: resource.position + direction,
                })
              }
            />
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Este mes todavía no tiene recursos.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
