import type { ReactNode } from 'react'

export type ModalAction = 'dismiss' | 'close' | 'confirm'

export type ModalSize = 'compact' | 'default' | 'large' | 'fullscreen'

export interface ModalResult<TResult> {
  action: ModalAction
  value?: TResult
}

export interface ModalTemplateProps<TData, TResult> {
  data: TData
  confirm: (value?: TResult) => void
  close: () => void
  dismiss: () => void
}

export type ModalTemplate<TData, TResult> = (props: ModalTemplateProps<TData, TResult>) => ReactNode

export interface ModalOpenOptions<TData, TResult> {
  data: TData
  template: ModalTemplate<TData, TResult>
  title?: ReactNode
  description?: ReactNode
  dismissible?: boolean
  size?: ModalSize
}
