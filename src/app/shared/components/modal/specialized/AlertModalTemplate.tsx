import { IconAlertTriangle, IconCircleCheck, IconInfoCircle, IconX } from '@tabler/icons-react'
import type { ComponentType, SVGProps } from 'react'
import { Button } from '@/app/shared/components/ui/button'
import type { ModalTemplateProps } from '@/app/shared/models/modal'

export type AlertModalTone = 'warning' | 'error' | 'success' | 'info'

export interface AlertModalData {
  tone: AlertModalTone
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
}

const toneConfig: Record<
  AlertModalTone,
  { Icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>; className: string }
> = {
  warning: { Icon: IconAlertTriangle, className: 'text-amber-700' },
  error: { Icon: IconX, className: 'text-destructive' },
  success: { Icon: IconCircleCheck, className: 'text-emerald-700' },
  info: { Icon: IconInfoCircle, className: 'text-blue-700' },
}

export function AlertModalTemplate({
  data,
  confirm,
  close,
}: ModalTemplateProps<AlertModalData, undefined>) {
  const { Icon, className } = toneConfig[data.tone]
  return (
    <div className="grid gap-5">
      <div className="flex items-start gap-3">
        <Icon size={24} aria-hidden="true" className={className} />
        <p className="text-sm text-muted-foreground">{data.message}</p>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={close}>
          {data.cancelLabel}
        </Button>
        <Button
          type="button"
          variant={data.tone === 'error' ? 'destructive' : 'default'}
          onClick={() => confirm()}
        >
          {data.confirmLabel}
        </Button>
      </div>
    </div>
  )
}
