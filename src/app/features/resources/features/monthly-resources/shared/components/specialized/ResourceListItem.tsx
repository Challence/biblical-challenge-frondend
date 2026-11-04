import { IconArrowDown, IconArrowUp, IconEdit, IconTrash } from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'
import { ShareButton } from '@/app/shared/components/share/ShareButton'
import type { MonthlyResource } from '../../../models/resource'

export function ResourceListItem({
  resource,
  first,
  last,
  onEdit,
  onDelete,
  onMove,
  monthDate,
}: {
  resource: MonthlyResource
  first: boolean
  last: boolean
  onEdit: () => void
  onDelete: () => void
  onMove: (direction: -1 | 1) => void
  monthDate?: string
}) {
  return (
    <article className="flex items-center gap-3 rounded-lg border bg-background p-3">
      <div className="h-16 w-24 shrink-0 overflow-hidden rounded bg-muted">
        {resource.type === 'image' && resource.imageUrl ? (
          <img src={resource.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Video
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{resource.type === 'image' ? 'Imagen' : 'Video'}</p>
        {resource.type === 'video' && (
          <a
            className="block truncate text-sm text-muted-foreground underline"
            href={resource.videoUrl ?? undefined}
            target="_blank"
            rel="noreferrer"
          >
            {resource.videoUrl}
          </a>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <ShareButton
          content={{
            kind: 'monthlyResource',
            data: {
              ...resource,
              date: monthDate,
              publicUrl: `${window.location.origin}/recursos/${resource.id}`,
            },
            files: resource.type === 'image' && resource.imageUrl ? [resource.imageUrl] : undefined,
            entityId: resource.id,
          }}
          variant="admin"
          accessibleLabel={`Compartir ${resource.title}`}
        />
        <Button
          size="icon"
          variant="ghost"
          aria-label="Subir recurso"
          disabled={first}
          onClick={() => onMove(-1)}
        >
          <IconArrowUp aria-hidden="true" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Bajar recurso"
          disabled={last}
          onClick={() => onMove(1)}
        >
          <IconArrowDown aria-hidden="true" />
        </Button>
        <Button size="icon" variant="ghost" aria-label="Editar recurso" onClick={onEdit}>
          <IconEdit aria-hidden="true" />
        </Button>
        <Button size="icon" variant="ghost" aria-label="Eliminar recurso" onClick={onDelete}>
          <IconTrash aria-hidden="true" />
        </Button>
      </div>
    </article>
  )
}
