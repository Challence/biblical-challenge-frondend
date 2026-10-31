import { useCallback } from 'react'
import {
  AlertModalTemplate,
  type AlertModalData,
  type AlertModalTone,
} from '@/app/shared/components/modal/specialized/AlertModalTemplate'
import { useModal } from './useModal'
import type { ModalResult } from '@/app/shared/models/modal'

interface AlertOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
}

export function useModalAlert() {
  const { open } = useModal()
  const alert = useCallback(
    (tone: AlertModalTone, options: AlertOptions): Promise<ModalResult<undefined>> =>
      open<AlertModalData, undefined>({
        data: {
          tone,
          title: options.title,
          message: options.message,
          confirmLabel: options.confirmLabel ?? 'Confirmar',
          cancelLabel: options.cancelLabel ?? 'Cancelar',
        },
        title: options.title,
        dismissible: true,
        size: 'compact',
        template: AlertModalTemplate,
      }),
    [open],
  )
  return {
    warning: (options: AlertOptions) => alert('warning', options),
    error: (options: AlertOptions) => alert('error', options),
    success: (options: AlertOptions) => alert('success', options),
    info: (options: AlertOptions) => alert('info', options),
  }
}
