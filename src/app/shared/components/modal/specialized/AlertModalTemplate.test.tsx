import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AlertModalTemplate } from './AlertModalTemplate'

describe('AlertModalTemplate', () => {
  it('renders the alert and resolves explicit confirm and close actions', async () => {
    const confirm = vi.fn()
    const close = vi.fn()
    render(
      <AlertModalTemplate
        data={{
          tone: 'warning',
          title: 'Eliminar segmento',
          message: '¿Eliminar este segmento?',
          confirmLabel: 'Eliminar',
          cancelLabel: 'Cancelar',
        }}
        confirm={confirm}
        close={close}
        dismiss={vi.fn()}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Eliminar segmento' })).toBeTruthy()
    const message = screen.getByText('¿Eliminar este segmento?')
    expect(message).toBeTruthy()
    const content = message.parentElement
    expect(content?.classList.contains('flex')).toBe(true)
    expect(content?.classList.contains('flex-col')).toBe(true)
    expect(content?.classList.contains('items-center')).toBe(true)
    expect(content?.classList.contains('text-center')).toBe(true)
    const icon = content?.querySelector('[aria-hidden="true"]')
    expect(icon).toBeTruthy()
    expect(icon?.parentElement?.classList.contains('rounded-full')).toBe(true)
    expect(icon?.parentElement?.classList.contains('bg-amber-100')).toBe(true)
    expect(icon?.parentElement?.classList.contains('items-center')).toBe(true)
    expect(icon?.parentElement?.classList.contains('justify-center')).toBe(true)
    expect(icon?.parentElement?.nextElementSibling?.textContent).toBe('Eliminar segmento')
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    const confirmButton = screen.getByRole('button', { name: 'Eliminar' })
    expect(confirmButton.classList.contains('bg-orange-600')).toBe(true)
    expect(confirmButton.classList.contains('text-white')).toBe(true)
    expect(confirmButton.classList.contains('hover:bg-orange-700')).toBe(true)
    expect(confirmButton.classList.contains('focus-visible:ring-orange-600')).toBe(true)
    fireEvent.click(confirmButton)
    expect(close).toHaveBeenCalledOnce()
    expect(confirm).toHaveBeenCalledOnce()
  })

  it.each([
    ['error', 'bg-red-100', 'bg-destructive'],
    ['success', 'bg-emerald-100', 'bg-primary'],
    ['info', 'bg-blue-100', 'bg-primary'],
  ] as const)('uses contextual styles for %s alerts', (tone, backgroundClass, confirmClass) => {
    render(
      <AlertModalTemplate
        data={{
          tone,
          title: 'Título',
          message: 'Mensaje',
          confirmLabel: 'Aceptar',
          cancelLabel: 'Cerrar',
        }}
        confirm={vi.fn()}
        close={vi.fn()}
        dismiss={vi.fn()}
      />,
    )

    const icon = screen.getByText('Mensaje').parentElement?.querySelector('[aria-hidden="true"]')
    expect(icon?.parentElement?.classList.contains(backgroundClass)).toBe(true)
    const button = screen.getByRole('button', { name: 'Aceptar' })
    expect(button.classList.contains(confirmClass)).toBe(true)
  })
})
