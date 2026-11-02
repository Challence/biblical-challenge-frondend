import type { ResourceMonth, MonthlyResource } from '../../../models/resource'
import { ResourceMonthItem } from './ResourceMonthItem'

export function ResourceMonthList({
  months,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onMove,
  onEditResource,
  onDeleteResourceRequest,
  onCreateResource,
}: {
  months: ResourceMonth[]
  expanded: Record<string, boolean>
  onToggle: (id: string) => void
  onEdit?: (month: ResourceMonth) => void
  onDelete?: (month: ResourceMonth) => void
  onMove?: (month: ResourceMonth, direction: -1 | 1) => void
  onEditResource?: (resource: MonthlyResource) => void
  onDeleteResourceRequest?: (resource: MonthlyResource) => void
  onCreateResource?: (month: ResourceMonth) => void
}) {
  return (
    <div className="space-y-2">
      {months.map((month, index) => (
        <ResourceMonthItem
          key={month.id}
          month={month}
          index={index}
          total={months.length}
          expanded={expanded[month.id] ?? false}
          onToggle={() => onToggle(month.id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={onMove}
          onEditResource={onEditResource}
          onDeleteResourceRequest={onDeleteResourceRequest}
          onCreateResource={onCreateResource}
        />
      ))}
    </div>
  )
}
