import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePublicSegment } from '../../hooks/usePublicSegments'
import { PublicSegmentDetailPage } from './PublicSegmentDetailPage'

const track = vi.fn()
vi.mock('@/app/shared/analytics/useAnalytics', () => ({ useAnalytics: () => ({ track }) }))
vi.mock('../../hooks/usePublicSegments', () => ({ usePublicSegment: vi.fn() }))

const segment = {
  id: 'november',
  title: 'Noviembre',
  month: 11,
  year: 2026,
  coverPath: '',
  days: [],
}

describe('PublicSegmentDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usePublicSegment).mockReturnValue({
      data: segment,
      isLoading: false,
      isError: false,
    } as never)
  })

  it('registra una apertura una sola vez aunque la página se renderice de nuevo', () => {
    const view = render(
      <MemoryRouter>
        <PublicSegmentDetailPage />
      </MemoryRouter>,
    )
    view.rerender(
      <MemoryRouter>
        <PublicSegmentDetailPage />
      </MemoryRouter>,
    )

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith({ type: 'segment_viewed', segmentId: 'november' })
  })
})
