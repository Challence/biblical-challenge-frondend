import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { PublicSegmentCalendar } from './PublicSegmentGuideDialog'

describe('PublicSegmentCalendar', () => {
  it('aligns weekdays and enables only configured days', () => {
    render(
      <MemoryRouter>
        <PublicSegmentCalendar
          segment={{ id: 'one', title: 'Guía', month: 10, year: 2026, days: [{ day: 5 }] }}
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    )

    expect(screen.getByRole('grid')).toHaveAccessibleName('Calendario de Octubre 2026')
    expect(screen.getByRole('button', { name: 'Día 5, configurado' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Día 6, no disponible' })).toBeDisabled()
  })

  it('shows an explicit empty state when a segment has no days', () => {
    render(
      <MemoryRouter>
        <PublicSegmentCalendar
          segment={{ id: 'empty', title: 'Vacía', month: 1, year: 2026, days: [] }}
          onClose={vi.fn()}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('No hay días definidos para este segmento.')).toBeInTheDocument()
  })
})
