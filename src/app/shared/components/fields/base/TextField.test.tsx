import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TextField } from './TextField'

describe('TextField', () => {
  it('renders an accessible required input and emits its value', () => {
    const onChange = vi.fn()
    render(
      <TextField
        id="name"
        label="Nombre"
        value="Ana"
        onChange={onChange}
        required
        helperText="Tu nombre"
      />,
    )
    const input = screen.getByRole('textbox', { name: 'Nombre *' })
    expect(input).toBeRequired()
    expect(input).toHaveAccessibleDescription('Tu nombre')
    fireEvent.change(input, { target: { value: 'Luis' } })
    expect(onChange).toHaveBeenCalledWith('Luis')
  })

  it('renders error and disabled states', () => {
    render(
      <TextField
        id="email"
        label="Correo"
        value=""
        onChange={() => undefined}
        error="Correo inválido"
        disabled
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Correo' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Correo inválido')
  })
})
