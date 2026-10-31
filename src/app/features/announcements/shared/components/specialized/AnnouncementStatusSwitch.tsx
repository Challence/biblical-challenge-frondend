import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'

type Props = { title: string; active: boolean; disabled?: boolean; onToggle: () => void }

export function AnnouncementStatusSwitch({ title, active, disabled, onToggle }: Props) {
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={disabled}
      aria-label={active ? `Desactivar ${title}` : `Activar ${title}`}
      onClick={onToggle}
    >
      {active ? <IconPlayerPause aria-hidden="true" /> : <IconPlayerPlay aria-hidden="true" />}
    </Button>
  )
}
