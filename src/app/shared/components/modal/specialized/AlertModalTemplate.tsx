import { IconAlertTriangle, IconCircleCheck, IconInfoCircle, IconX } from '@tabler/icons-react'
import type { ComponentType, SVGProps } from 'react'
import { Button } from '@/app/shared/components/ui/button'
import { DialogDescription, DialogTitle } from '@/app/shared/components/ui/dialog'
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
  {
    Icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>
    className: string
    backgroundClassName: string
    confirmClassName: string
  }
> = {
  warning: {
    Icon: IconAlertTriangle,
    className: 'text-amber-700',
    backgroundClassName: 'bg-amber-100',
    confirmClassName: 'bg-orange-600 text-white hover:bg-orange-700 focus-visible:ring-orange-600',
  },
  error: {
    Icon: IconX,
    className: 'text-destructive',
    backgroundClassName: 'bg-red-100',
    confirmClassName: 'focus-visible:ring-destructive',
  },
  success: {
    Icon: IconCircleCheck,
    className: 'text-emerald-700',
    backgroundClassName: 'bg-emerald-100',
    confirmClassName: '',
  },
  info: {
    Icon: IconInfoCircle,
    className: 'text-blue-700',
    backgroundClassName: 'bg-blue-100',
    confirmClassName: '',
  },
}

export function AlertModalTemplate({
  data,
  confirm,
  close,
}: ModalTemplateProps<AlertModalData, undefined>) {
  const { Icon, className, backgroundClassName, confirmClassName } = toneConfig[data.tone]
  return (
    <div className="grid gap-5" data-modal-template="alert">
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className={`flex size-20 items-center justify-center rounded-full ${backgroundClassName}`}
        >
          <Icon size={40} stroke="1.5" aria-hidden="true" className={className} />
        </div>
        <DialogTitle>{data.title}</DialogTitle>
        <DialogDescription>{data.message}</DialogDescription>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={close}>
          {data.cancelLabel}
        </Button>
        <Button
          type="button"
          variant={data.tone === 'error' ? 'destructive' : 'default'}
          className={confirmClassName}
          onClick={() => confirm()}
        >
          {data.confirmLabel}
        </Button>
      </div>
    </div>
  )
}
