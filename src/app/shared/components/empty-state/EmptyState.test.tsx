import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders its title and description with accessible relationships', () => {
    render(
      <EmptyState title="Sin resultados" description="Prueba con otros términos de búsqueda." />,
    )

    const region = screen.getByRole('region', { name: 'Sin resultados' })
    expect(region.getAttribute('aria-describedby')).toMatch(/-description$/)
    expect(screen.getByRole('heading', { name: 'Sin resultados' })).toBeTruthy()
    expect(screen.getByText('Prueba con otros términos de búsqueda.')).toBeTruthy()
  })

  it('merges a custom class name and hides its decorative icon', () => {
    render(
      <EmptyState
        title="Lista vacía"
        description="Aún no hay elementos."
        className="custom-state"
      />,
    )

    expect(screen.getByRole('region').classList).toContain('custom-state')
    expect(document.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('supports a title without a description', () => {
    render(<EmptyState title="Sin elementos" />)

    expect(
      screen.getByRole('region', { name: 'Sin elementos' }).getAttribute('aria-describedby'),
    ).toBeNull()
  })
})
