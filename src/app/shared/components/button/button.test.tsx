import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button'

describe('Button', () => {
  it('renders children and variant styles', () => {
    render(<Button variant="secondary">Guardar</Button>)
    expect(screen.getByRole('button', { name: 'Guardar' }).className).toContain('secondary')
  })

  it('supports disabled state and interaction', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Continuar</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(onClick).toHaveBeenCalledOnce()
    render(<Button disabled>Bloqueado</Button>)
    expect(screen.getByRole('button', { name: 'Bloqueado' })).toBeDisabled()
  })
})
