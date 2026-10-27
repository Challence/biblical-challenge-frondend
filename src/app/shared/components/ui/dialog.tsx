import * as React from 'react'
import { cn } from '@/app/shared/lib/utils'

type DialogContextValue = { open: boolean; onOpenChange: (open: boolean) => void }
const DialogContext = React.createContext<DialogContextValue | null>(null)

export function Dialog({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>
}

export function DialogContent({ className, variant = 'default', children, ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'fullscreen' }) {
  const context = React.useContext(DialogContext)
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (!context?.open) return
    const previous = document.activeElement as HTMLElement | null
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') context.onOpenChange(false)
      if (event.key !== 'Tab' || !ref.current) return
      const focusable = ref.current.querySelectorAll<HTMLElement>('button, input, textarea, [tabindex]:not([tabindex="-1"])')
      if (!focusable.length) return
      const first = focusable[0]; const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKeyDown)
    requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus())
    return () => { document.removeEventListener('keydown', onKeyDown); previous?.focus() }
  }, [context])
  if (!context?.open) return null
  const fullscreen = variant === 'fullscreen'
  return <div className={cn('fixed inset-0 z-50 flex pointer-events-auto items-end justify-center bg-black/50 p-3 sm:items-center sm:p-4', fullscreen && 'overflow-hidden p-0')} role="presentation" onMouseDown={(e) => e.target === e.currentTarget && context.onOpenChange(false)}>
    <div ref={ref} role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()} className={cn('relative z-10 w-full max-w-2xl rounded-lg border bg-background p-6 shadow-lg pointer-events-auto', fullscreen && 'h-[100dvh] max-h-[100dvh] w-[100vw] max-w-none rounded-none border-0 bg-black p-[env(safe-area-inset-top)_env(safe-area-inset-right)_env(safe-area-inset-bottom)_env(safe-area-inset-left)] shadow-none', className)} {...props}>{children}</div>
  </div>
}
export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn('mb-5 space-y-1.5', className)} {...props} /> }
export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) { return <h2 className={cn('text-xl font-semibold', className)} {...props} /> }
export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) { return <p className={cn('text-sm text-muted-foreground', className)} {...props} /> }
