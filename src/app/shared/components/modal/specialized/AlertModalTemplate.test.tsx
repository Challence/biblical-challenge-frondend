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

    expect(screen.queryAllByText('Eliminar segmento')).toHaveLength(0)
    expect(screen.getByText('¿Eliminar este segmento?')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(close).toHaveBeenCalledOnce()
    expect(confirm).toHaveBeenCalledOnce()
  })
})
