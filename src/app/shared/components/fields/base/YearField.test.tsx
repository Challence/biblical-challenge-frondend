import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { YearField } from './YearField'

describe('YearField', () => {
  it('selects only a year from a bounded, paginated grid', () => {
    const onChange = vi.fn()
    render(
      <YearField
        id="year"
        label="Año"
        value="2024"
        onChange={onChange}
        min={2000}
        max={2200}
        required
      />,
    )

    const trigger = screen.getByRole('button', { name: 'Año * 2024' })
    fireEvent.click(trigger)
    expect(screen.getAllByRole('button', { name: /^20\d{2}$/ })).toHaveLength(12)
    fireEvent.click(screen.getByRole('button', { name: '2025' }))

    expect(onChange).toHaveBeenCalledWith('2025')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('navigates intervals and closes with Escape while restoring focus', () => {
    render(
      <YearField
        id="year"
        label="Año"
        value="2024"
        onChange={() => undefined}
        min={2024}
        max={2031}
      />,
    )
    const trigger = screen.getByRole('button', { name: 'Año 2024' })
    fireEvent.click(trigger)
    expect(screen.getByText('2024–2031')).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('exposes disabled, helper and error states accessibly', () => {
    const { rerender } = render(
      <YearField
        id="year"
        label="Año"
        value=""
        onChange={() => undefined}
        min={2024}
        max={2031}
        helperText="Ayuda"
        disabled
      />,
    )
    expect(screen.getByRole('button', { name: 'Año Selecciona un año' })).toBeDisabled()
    expect(screen.getByRole('button')).toHaveAccessibleDescription('Ayuda')

    rerender(
      <YearField
        id="year"
        label="Año"
        value=""
        onChange={() => undefined}
        min={2024}
        max={2031}
        error="Selecciona un año"
      />,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Selecciona un año')
  })
})
