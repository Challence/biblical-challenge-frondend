import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { ModalDialog } from '@/app/shared/components/modal/base/ModalDialog'
import type {
  ModalAction,
  ModalOpenOptions,
  ModalResult,
  ModalTemplateProps,
} from '@/app/shared/models/modal'

interface ModalRequest {
  options: ModalOpenOptions<unknown, unknown>
  resolve: (result: ModalResult<unknown>) => void
}

interface ModalContextValue {
  open: <TData, TResult>(options: ModalOpenOptions<TData, TResult>) => Promise<ModalResult<TResult>>
}

const ModalContext = createContext<ModalContextValue | null>(null)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ModalRequest | null>(null)
  const currentRef = useRef<ModalRequest | null>(null)
  const queueRef = useRef<ModalRequest[]>([])
  const settledRef = useRef(new WeakSet<object>())

  const showNext = useCallback(() => {
    const next = queueRef.current.shift() ?? null
    currentRef.current = next
    setCurrent(next)
  }, [])

  const settle = useCallback(
    (action: ModalAction, value?: unknown) => {
      const request = currentRef.current
      if (!request || settledRef.current.has(request)) return
      settledRef.current.add(request)
      request.resolve({ action, ...(value === undefined ? {} : { value }) })
      showNext()
    },
    [showNext],
  )

  const open = useCallback(<TData, TResult>(options: ModalOpenOptions<TData, TResult>) => {
    return new Promise<ModalResult<TResult>>((resolve) => {
      const request = { options, resolve } as unknown as ModalRequest
      if (currentRef.current) queueRef.current.push(request)
      else {
        currentRef.current = request
        setCurrent(request)
      }
    })
  }, [])

  useEffect(() => {
    const settled = settledRef.current
    return () => {
      if (currentRef.current && !settled.has(currentRef.current)) {
        settled.add(currentRef.current)
        currentRef.current.resolve({ action: 'dismiss' })
      }
      queueRef.current.forEach((request) => request.resolve({ action: 'dismiss' }))
      queueRef.current = []
    }
  }, [])

  const contextValue = useMemo<ModalContextValue>(() => ({ open }), [open])
  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {current && <ModalRenderer request={current} settle={settle} />}
    </ModalContext.Provider>
  )
}

function ModalRenderer({
  request,
  settle,
}: {
  request: ModalRequest
  settle: (action: ModalAction, value?: unknown) => void
}) {
  const { options } = request
  return (
    <ModalDialog
      open
      title={options.title}
      description={options.description}
      dismissible={options.dismissible}
      size={options.size ?? 'default'}
      onOpenChange={() => settle('dismiss')}
    >
      {options.template({
        data: options.data,
        confirm: (value) => settle('confirm', value),
        close: () => settle('close'),
        dismiss: () => settle('dismiss'),
      } as ModalTemplateProps<unknown, unknown>)}
    </ModalDialog>
  )
}

export function useModalContext() {
  const context = useContext(ModalContext)
  if (!context) throw new Error('useModal debe usarse dentro de un ModalProvider')
  return context
}
