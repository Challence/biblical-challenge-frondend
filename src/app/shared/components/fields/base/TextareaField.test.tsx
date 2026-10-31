import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TextareaField } from './TextareaField'

describe('TextareaField', () => {
  it('renders a labelled textarea and emits its value', () => {
    const onChange = vi.fn()
    render(
      <TextareaField
        id="bio"
        label="Biografía"
        value="Hola"
        onChange={onChange}
        helperText="Máximo 200 caracteres"
      />,
    )
    const textarea = screen.getByRole('textbox', { name: 'Biografía' })
    expect(textarea).toHaveAccessibleDescription('Máximo 200 caracteres')
    fireEvent.change(textarea, { target: { value: 'Adiós' } })
    expect(onChange).toHaveBeenCalledWith('Adiós')
  })

  it('renders required, error and disabled states', () => {
    render(
      <TextareaField
        id="notes"
        label="Notas"
        value=""
        onChange={() => undefined}
        required
        error="Las notas son obligatorias"
        disabled
      />,
    )
    expect(screen.getByRole('textbox', { name: 'Notas *' })).toBeDisabled()
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Las notas son obligatorias')
  })
})
