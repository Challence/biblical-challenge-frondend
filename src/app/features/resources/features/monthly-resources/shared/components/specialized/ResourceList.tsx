import type { MonthlyResource } from '../../../models/resource'
import { ResourceListItem } from './ResourceListItem'

export function ResourceList({
  resources,
  onEdit,
  onDelete,
  onMove,
}: {
  resources: MonthlyResource[]
  onEdit: (resource: MonthlyResource) => void
  onDelete: (resource: MonthlyResource) => void
  onMove: (resource: MonthlyResource, direction: -1 | 1) => void
}) {
  const ordered = [...resources].sort((a, b) => a.position - b.position)
  return (
    <div className="space-y-2" aria-label="Lista de recursos">
      {ordered.map((resource, index) => (
        <ResourceListItem
          key={resource.id}
          resource={resource}
          first={index === 0}
          last={index === ordered.length - 1}
          onEdit={() => onEdit(resource)}
          onDelete={() => onDelete(resource)}
          onMove={(direction) => onMove(resource, direction)}
        />
      ))}
    </div>
  )
}
