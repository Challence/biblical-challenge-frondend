import type { ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'

interface ModalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  description?: ReactNode
  dismissible?: boolean
  children: ReactNode
}

/** Shared shell only; content and terminal actions belong to the composed template. */
export function ModalDialog({
  open,
  onOpenChange,
  title,
  description,
  dismissible = true,
  children,
}: ModalDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && dismissible) onOpenChange(false)
      }}
    >
      <DialogContent aria-label={typeof title === 'string' ? title : undefined}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}
