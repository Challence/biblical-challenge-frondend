import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'

type SegmentStatusSwitchProps = {
  title: string
  status: 'draft' | 'active'
  disabled?: boolean
  onToggle: () => void
}

export function SegmentStatusSwitch({
  title,
  status,
  disabled = false,
  onToggle,
}: SegmentStatusSwitchProps) {
  const isActive = status === 'active'

  return (
    <Button
      type="button"
      aria-label={`${isActive ? 'Pausar' : 'Activar'} ${title}`}
      disabled={disabled}
      variant="ghost"
      className="size-11 text-muted-foreground hover:bg-muted hover:text-foreground"
      onClick={onToggle}
    >
      {isActive ? <IconPlayerPause aria-hidden="true" /> : <IconPlayerPlay aria-hidden="true" />}
    </Button>
  )
}
