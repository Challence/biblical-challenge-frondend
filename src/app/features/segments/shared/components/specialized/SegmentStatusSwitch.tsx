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
      role="switch"
      aria-checked={isActive}
      aria-label={`${isActive ? 'Desactivar' : 'Activar'} ${title}`}
      disabled={disabled}
      variant="ghost"
      className="h-11 min-w-16 rounded-full px-2 text-xs font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
      onClick={onToggle}
    >
      <span
        aria-hidden="true"
        className={`flex h-6 w-12 items-center rounded-full p-1 transition-colors ${
          isActive ? 'justify-end bg-primary' : 'justify-start bg-muted-foreground/30'
        }`}
      >
        <span className="size-4 rounded-full bg-background shadow-sm" />
      </span>
      <span aria-hidden="true">{isActive ? 'ON' : 'OFF'}</span>
    </Button>
  )
}
