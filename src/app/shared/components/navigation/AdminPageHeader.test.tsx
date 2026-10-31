import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AdminPageHeader } from './AdminPageHeader'

describe('AdminPageHeader', () => {
  it('renders an accessible title, optional description and composed action', () => {
    render(
      <AdminPageHeader
        title="Recursos"
        titleId="resources-title"
        description="Gestiona los recursos administrativos."
        action={<button type="button">Nuevo recurso</button>}
      />,
    )

    expect(screen.getByRole('heading', { level: 1, name: 'Recursos' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recursos' })).toHaveAttribute(
      'id',
      'resources-title',
    )
    expect(screen.getByText('Gestiona los recursos administrativos.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nuevo recurso' })).toBeInTheDocument()
  })

  it('does not render absent optional content', () => {
    render(<AdminPageHeader title="Configuración" />)

    expect(screen.getByRole('heading', { name: 'Configuración' })).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
