import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Empty } from './Empty'

describe('Empty', () => {
  it('renders the message and illustration', () => {
    render(<Empty msg="No hay set de lecturas" />)

    expect(screen.getByRole('region', { name: 'No hay set de lecturas' })).toBeVisible()
    expect(screen.getByRole('img')).toHaveAttribute(
      'alt',
      'Ilustración de una Biblia con una lupa y un signo de interrogación',
    )
  })

  it('applies the selected size', () => {
    render(<Empty size="lg" msg="Sin contenido" />)

    expect(screen.getByRole('img')).toHaveClass('h-48', 'w-72')
  })
})
