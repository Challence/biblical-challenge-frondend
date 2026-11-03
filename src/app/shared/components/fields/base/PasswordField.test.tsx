import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PasswordField } from './PasswordField'

describe('PasswordField', () => {
  it('renders an accessible controlled required field and toggles visibility', () => {
    const onChange = vi.fn()
    render(
      <PasswordField
        id="password"
        label="Contraseña"
        value="secreta"
        onChange={onChange}
        required
        helperText="Mínimo 8 caracteres"
      />,
    )
    const input = screen.getByLabelText('Contraseña *')
    expect(input).toHaveAttribute('type', 'password')
    expect(input).toBeRequired()
    expect(input).toHaveAccessibleDescription('Mínimo 8 caracteres')
    fireEvent.change(input, { target: { value: 'nueva' } })
    expect(onChange).toHaveBeenCalledWith('nueva')
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('renders error and disabled states', () => {
    render(
      <PasswordField
        id="password-error"
        label="Contraseña"
        value=""
        onChange={() => undefined}
        error="La contraseña es obligatoria"
        disabled
      />,
    )
    expect(screen.getByLabelText('Contraseña')).toBeDisabled()
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('La contraseña es obligatoria')
    expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeDisabled()
  })
})
