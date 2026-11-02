import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReadingGuideFilters } from './ReadingGuideFilters'

describe('ReadingGuideFilters', () => {
  it('shows Todos, all months, and unique sorted years from guides', () => {
    render(
      <ReadingGuideFilters
        guides={[
          { monthDate: '2025-02' } as never,
          { monthDate: '2023-12' } as never,
          { monthDate: '2025-01' } as never,
        ]}
        value={{ month: '', year: '' }}
        onChange={() => undefined}
      />,
    )

    expect((screen.getByLabelText('Mes') as HTMLSelectElement).value).toBe('')
    expect((screen.getByLabelText('Año') as HTMLSelectElement).value).toBe('')
    expect(screen.getByRole('option', { name: 'enero' })).toBeInTheDocument()
    expect(screen.getAllByRole('option', { name: '2025' })).toHaveLength(1)
    expect(screen.getAllByRole('option', { name: 'Todos' })).toHaveLength(2)
  })
})
