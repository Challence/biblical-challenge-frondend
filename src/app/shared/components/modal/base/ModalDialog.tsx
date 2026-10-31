import { isValidElement, type ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'
import type { ModalSize } from '@/app/shared/models/modal'

interface ModalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  description?: ReactNode
  dismissible?: boolean
  size?: ModalSize
  children: ReactNode
}

/** Shared shell only; content and terminal actions belong to the composed template. */
export function ModalDialog({
  open,
  onOpenChange,
  title,
  description,
  dismissible = true,
  size = 'default',
  children,
}: ModalDialogProps) {
  const isAlertTemplate =
    isValidElement<{ 'data-modal-template'?: string }>(children) &&
    children.props['data-modal-template'] === 'alert'
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && dismissible) onOpenChange(false)
      }}
    >
      <DialogContent
        variant={size === 'fullscreen' ? 'fullscreen' : 'default'}
        className={size === 'compact' ? 'max-w-md' : size === 'large' ? 'max-w-4xl' : undefined}
        aria-label={typeof title === 'string' ? title : undefined}
      >
        {isAlertTemplate ? (
          children
        ) : (
          <>
            {(title || description) && (
              <DialogHeader className="text-center">
                {title && <DialogTitle>{title}</DialogTitle>}
                {description && <DialogDescription>{description}</DialogDescription>}
              </DialogHeader>
            )}
            {children}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
