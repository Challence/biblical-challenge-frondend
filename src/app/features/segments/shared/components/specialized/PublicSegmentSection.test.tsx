import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePublicSegments } from '../../../hooks/usePublicSegments'
import { PublicSegmentSection } from './PublicSegmentSection'

vi.mock('../../../hooks/usePublicSegments', () => ({ usePublicSegments: vi.fn() }))
vi.mock('./PublicSegmentList', () => ({
  PublicSegmentList: () => <div data-testid="public-segment-list" />,
}))

describe('PublicSegmentSection', () => {
  it('presenta las lecturas mensuales disponibles', () => {
    vi.mocked(usePublicSegments).mockReturnValue({
      data: [{ id: 'segment-1', title: 'Enero', month: 1, year: 2026, days: 31 }],
      isLoading: false,
      isError: false,
    } as ReturnType<typeof usePublicSegments>)

    render(<PublicSegmentSection />)

    expect(screen.getByRole('heading', { name: 'Lectura por mes' })).toBeVisible()
    expect(screen.getByTestId('public-segment-list')).toBeVisible()
  })

  it('presenta el estado vacío', () => {
    vi.mocked(usePublicSegments).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof usePublicSegments>)

    render(<PublicSegmentSection />)

    const emptyState = screen.getByRole('region', { name: 'No hay set de lecturas' })
    expect(emptyState).toBeVisible()
    expect(emptyState.querySelector('img')).toHaveAttribute(
      'alt',
      'Ilustración de una Biblia con una lupa y un signo de interrogación',
    )
    expect(screen.queryByText('0')).toBeNull()
  })
})
