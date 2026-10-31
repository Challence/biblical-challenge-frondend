import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ModalProvider } from './ModalProvider'
import { useModal } from '@/app/shared/hooks/useModal'
import { useModalAlert } from '@/app/shared/hooks/useModalAlert'

function Trigger() {
  const { open } = useModal()
  return (
    <button
      onClick={() =>
        void open({
          data: 'dato',
          template: ({ data, confirm, close, dismiss }) => (
            <div>
              <span>{data}</span>
              <button onClick={() => confirm('ok')}>Confirmar</button>
              <button onClick={close}>Cerrar</button>
              <button onClick={dismiss}>Descartar</button>
            </div>
          ),
        })
      }
    >
      Abrir
    </button>
  )
}

function QueueTrigger({
  onPromise,
}: {
  onPromise: (label: string, promise: Promise<unknown>) => void
}) {
  const { open } = useModal()

  const openRequest = (label: string) => {
    onPromise(
      label,
      open({
        data: label,
        template: ({ data, confirm, close, dismiss }) => (
          <div>
            <span>{data}</span>
            <button onClick={() => confirm('confirmado')}>Confirmar</button>
            <button onClick={close}>Cerrar</button>
            <button onClick={dismiss}>Descartar</button>
          </div>
        ),
      }),
    )
  }

  return (
    <>
      <button onClick={() => openRequest('primero')}>Abrir primero</button>
      <button onClick={() => openRequest('segundo')}>Abrir segundo</button>
    </>
  )
}

function SizeTrigger({ size }: { size: 'compact' | 'default' | 'large' | 'fullscreen' }) {
  const { open } = useModal()
  return (
    <button
      onClick={() =>
        void open({
          data: null,
          size,
          template: () => <div>Contenido</div>,
        })
      }
    >
      Abrir tamaño
    </button>
  )
}

function AlertTrigger() {
  const { info } = useModalAlert()
  return (
    <button onClick={() => void info({ title: 'Aviso', message: 'Mensaje breve' })}>
      Abrir alerta
    </button>
  )
}

describe('ModalProvider', () => {
  it('resolves distinct actions and queues requests FIFO', async () => {
    render(
      <ModalProvider>
        <Trigger />
      </ModalProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(screen.getByText('dato')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(screen.queryByText('dato')).not.toBeInTheDocument()
  })

  it('shows queued requests in FIFO order and dismisses the next request with Escape', async () => {
    let firstPromise: Promise<unknown> | undefined
    let secondPromise: Promise<unknown> | undefined

    render(
      <ModalProvider>
        <QueueTrigger
          onPromise={(label, promise) => {
            if (label === 'primero') firstPromise = promise
            else secondPromise = promise
          }}
        />
      </ModalProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Abrir primero' }))
    fireEvent.click(screen.getByRole('button', { name: 'Abrir segundo' }))

    expect(screen.getByText('primero')).toBeInTheDocument()
    expect(screen.queryByText('segundo')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(await screen.findByText('segundo')).toBeInTheDocument()
    expect(screen.queryByText('primero')).not.toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    await expect(firstPromise).resolves.toEqual({ action: 'confirm', value: 'confirmado' })
    await expect(secondPromise).resolves.toEqual({ action: 'dismiss' })
  })

  it('fails clearly outside the provider', () => {
    expect(() => render(<Trigger />)).toThrow('useModal debe usarse dentro de un ModalProvider')
  })

  it.each([
    ['compact', 'max-w-md'],
    ['default', 'max-w-2xl'],
    ['large', 'max-w-4xl'],
  ] as const)('applies the %s shell size', (size, className) => {
    render(
      <ModalProvider>
        <SizeTrigger size={size} />
      </ModalProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Abrir tamaño' }))
    expect(screen.getByRole('dialog')).toHaveClass(className)
  })

  it('keeps fullscreen modal behavior for the fullscreen size', () => {
    render(
      <ModalProvider>
        <SizeTrigger size="fullscreen" />
      </ModalProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Abrir tamaño' }))
    expect(screen.getByRole('dialog')).toHaveClass('max-w-none', 'h-[100dvh]')
  })

  it('uses the compact shell size for alerts', () => {
    render(
      <ModalProvider>
        <AlertTrigger />
      </ModalProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Abrir alerta' }))
    expect(screen.getByRole('dialog')).toHaveClass('max-w-md')
  })
})
