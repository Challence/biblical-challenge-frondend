import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ResourceMonthFilters } from './ResourceMonthFilters'

describe('ResourceMonthFilters', () => {
  it('renders independent accessible month and year selectors', () => {
    const { container } = render(
      <ResourceMonthFilters value={{ month: '', year: '' }} onChange={vi.fn()} />,
    )
    expect(screen.getByLabelText('Mes')).toBeInTheDocument()
    expect(screen.getByLabelText('Año')).toBeInTheDocument()
    expect(screen.getAllByRole('option', { name: 'Todos' })).toHaveLength(2)
    expect(container.firstElementChild).toHaveClass(
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-4',
      'gap-4',
    )
  })

  it('reports each filter change without local filtering', () => {
    const onChange = vi.fn()
    render(<ResourceMonthFilters value={{ month: '', year: '' }} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '2' } })
    expect(onChange).toHaveBeenCalledWith({ month: '2', year: '' })
    fireEvent.change(screen.getByLabelText('Año'), { target: { value: '2026' } })
    expect(onChange).toHaveBeenLastCalledWith({ month: '', year: '2026' })
  })
})
