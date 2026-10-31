import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SegmentStatusSwitch } from './SegmentStatusSwitch'

describe('SegmentStatusSwitch', () => {
  it('shows pause and exposes the active contextual action', () => {
    render(<SegmentStatusSwitch title="Adviento" status="active" onToggle={vi.fn()} />)

    const control = screen.getByRole('button', { name: 'Pausar Adviento' })
    expect(control.querySelector('svg')).toBeInTheDocument()
    expect(control).not.toHaveTextContent('ON')
  })

  it('shows play and exposes the draft contextual action', () => {
    render(<SegmentStatusSwitch title="Cuaresma" status="draft" onToggle={vi.fn()} />)

    const control = screen.getByRole('button', { name: 'Activar Cuaresma' })
    expect(control.querySelector('svg')).toBeInTheDocument()
    expect(control).not.toHaveTextContent('OFF')
  })

  it('calls the callback when enabled and blocks it when disabled', () => {
    const onToggle = vi.fn()
    const { rerender } = render(
      <SegmentStatusSwitch title="Pascua" status="draft" onToggle={onToggle} />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Activar Pascua' }))
    expect(onToggle).toHaveBeenCalledOnce()

    rerender(<SegmentStatusSwitch title="Pascua" status="draft" disabled onToggle={onToggle} />)
    const disabledControl = screen.getByRole('button', { name: 'Activar Pascua' })
    expect(disabledControl).toBeDisabled()

    fireEvent.click(disabledControl)
    expect(onToggle).toHaveBeenCalledOnce()
  })
})
