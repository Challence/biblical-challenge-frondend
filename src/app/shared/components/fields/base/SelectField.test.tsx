import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SelectField } from './SelectField'

const options = [{ value: 'one', label: 'Uno' }, { value: 'two', label: 'Dos' }]

describe('SelectField', () => {
  it('renders an accessible select and changes its value', () => {
    const onChange = vi.fn()
    render(<SelectField id="answer" label="Respuesta" options={options} value="one" onChange={onChange} required />)
    const select = screen.getByRole('combobox', { name: 'Respuesta *' })
    expect(select).toBeRequired()
    fireEvent.change(select, { target: { value: 'two' } })
    expect(onChange).toHaveBeenCalledWith('two')
  })

  it('renders error and disabled states', () => {
    render(<SelectField id="status" label="Estado" options={options} value="" onChange={() => undefined} error="Selecciona un estado" disabled />)
    const select = screen.getByRole('combobox', { name: 'Estado' })
    expect(select).toBeDisabled()
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Selecciona un estado')
  })
})
