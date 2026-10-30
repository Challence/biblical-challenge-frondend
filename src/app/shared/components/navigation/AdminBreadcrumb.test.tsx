import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AdminBreadcrumb } from './AdminBreadcrumb'

describe('AdminBreadcrumb', () => {
  it('renders navigable ancestors, current page and accessible back action', () => {
    render(
      <MemoryRouter>
        <AdminBreadcrumb
          items={[{ label: 'Inicio', to: '/admin' }]}
          currentLabel="Segmentos"
          backTo="/admin"
        />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: 'Volver' })).toHaveAttribute('title', 'Volver')
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/admin')
    expect(screen.getByText('Segmentos')).toHaveAttribute('aria-current', 'page')
    expect(screen.getAllByText('/')).toHaveLength(1)
  })
})
