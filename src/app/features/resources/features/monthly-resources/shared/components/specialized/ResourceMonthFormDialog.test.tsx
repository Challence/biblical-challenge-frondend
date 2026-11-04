import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ResourceMonthFormDialog } from './ResourceMonthFormDialog'

describe('ResourceMonthFormDialog', () => {
  it('keeps the form dialog open when the year selector closes with Escape', () => {
    render(
      <ResourceMonthFormDialog open onOpenChange={() => undefined} onSubmit={() => undefined} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Año Selecciona un año' }))
    expect(screen.getAllByRole('dialog')).toHaveLength(2)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.getByRole('dialog', { name: 'Nuevo mes' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Año' })).not.toBeInTheDocument()
  })

  it('submits the selected year as a four-digit string', async () => {
    const onSubmit = vi.fn()
    render(<ResourceMonthFormDialog open onOpenChange={() => undefined} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByRole('combobox', { name: 'Mes' }), {
      target: { value: '03' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Año Selecciona un año' }))
    fireEvent.click(screen.getByRole('button', { name: '2025' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ monthDate: '2025-03-01' }))
  })
})
