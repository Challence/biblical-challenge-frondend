import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SegmentStatusSwitch } from './SegmentStatusSwitch'

describe('SegmentStatusSwitch', () => {
  it('shows ON and exposes the active state and contextual action', () => {
    render(<SegmentStatusSwitch title="Adviento" status="active" onToggle={vi.fn()} />)

    const control = screen.getByRole('switch', { name: 'Desactivar Adviento' })
    expect(control).toHaveAttribute('aria-checked', 'true')
    expect(control).toHaveTextContent('ON')
  })

  it('shows OFF and exposes the draft state and contextual action', () => {
    render(<SegmentStatusSwitch title="Cuaresma" status="draft" onToggle={vi.fn()} />)

    const control = screen.getByRole('switch', { name: 'Activar Cuaresma' })
    expect(control).toHaveAttribute('aria-checked', 'false')
    expect(control).toHaveTextContent('OFF')
  })

  it('calls the callback when enabled and blocks it when disabled', () => {
    const onToggle = vi.fn()
    const { rerender } = render(
      <SegmentStatusSwitch title="Pascua" status="draft" onToggle={onToggle} />,
    )

    fireEvent.click(screen.getByRole('switch', { name: 'Activar Pascua' }))
    expect(onToggle).toHaveBeenCalledOnce()

    rerender(<SegmentStatusSwitch title="Pascua" status="draft" disabled onToggle={onToggle} />)
    const disabledControl = screen.getByRole('switch', { name: 'Activar Pascua' })
    expect(disabledControl).toBeDisabled()

    fireEvent.click(disabledControl)
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
