import '@testing-library/jest-dom/vitest'
import * as React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Switch } from './switch'

describe('Switch', () => {
  it('supports controlled state and switch semantics', () => {
    function ControlledSwitch() {
      const [checked, setChecked] = React.useState(false)
      return <Switch aria-label="Recordatorios" checked={checked} onCheckedChange={setChecked} />
    }

    render(<ControlledSwitch />)
    const control = screen.getByRole('switch', { name: 'Recordatorios' })
    expect(control).toHaveAttribute('aria-checked', 'false')
    fireEvent.click(control)
    expect(control).toHaveAttribute('aria-checked', 'true')
  })

  it('supports disabled state', () => {
    render(<Switch aria-label="Recordatorios" disabled />)
    expect(screen.getByRole('switch')).toBeDisabled()
  })
})
