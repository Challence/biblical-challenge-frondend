import { IconArrowDown, IconArrowUp, IconEdit, IconTrash } from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'
import { Card, CardContent } from '@/app/shared/components/ui/card'
import type { Announcement } from '../../../models/announcement'
import { AnnouncementStatusSwitch } from './AnnouncementStatusSwitch'
import { ShareButton } from '@/app/shared/components/share/ShareButton'

type Props = {
  item: Announcement
  index: number
  total: number
  imageUrl: string
  disabled?: boolean
  onEdit: () => void
  onToggle: () => void
  onRemove: () => void
  onMove: (direction: -1 | 1) => void
}

export function AnnouncementCard({
  item,
  index,
  total,
  imageUrl,
  disabled,
  onEdit,
  onToggle,
  onRemove,
  onMove,
}: Props) {
  return (
    <Card className="overflow-hidden">
      <img className="aspect-[16/7] w-full object-cover" src={imageUrl} alt="" />
      <CardContent className="grid gap-2 p-3">
        <p className="text-xs text-muted-foreground">{item.href}</p>
        <div className="flex flex-wrap justify-between gap-1 border-t pt-2">
          <div className="flex gap-1">
            <AnnouncementStatusSwitch
              title="anuncio"
              active={Boolean(item.active)}
              disabled={disabled}
              onToggle={onToggle}
            />
            <Button
              variant="outline"
              size="icon"
              disabled={disabled}
              aria-label="Editar anuncio"
              onClick={onEdit}
            >
              <IconEdit aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={disabled}
              aria-label="Eliminar anuncio"
              onClick={onRemove}
            >
              <IconTrash aria-hidden="true" />
            </Button>
          </div>
          <div className="flex">
            <ShareButton
              content={{
                kind: 'announcement',
                data: { ...item, imageUrl },
                publicUrl: item.href ?? undefined,
                files: [imageUrl],
                entityId: item.id,
              }}
              variant="admin"
              accessibleLabel="Compartir anuncio"
              disabled={disabled}
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Subir anuncio"
              disabled={disabled || index === 0}
              onClick={() => onMove(-1)}
            >
              <IconArrowUp aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Bajar anuncio"
              disabled={disabled || index === total - 1}
              onClick={() => onMove(1)}
            >
              <IconArrowDown aria-hidden="true" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
