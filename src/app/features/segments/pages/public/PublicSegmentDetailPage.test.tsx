import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
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

  it('muestra compartir junto al enlace de segmentos con los datos del segmento', () => {
    render(
      <MemoryRouter initialEntries={['/segmentos/november']}>
        <PublicSegmentDetailPage />
      </MemoryRouter>,
    )

    const share = screen.getByRole('button', { name: 'Compartir segmento' })
    expect(share).toBeInTheDocument()
    expect(screen.getByText('← Todos los segmentos').parentElement).toContainElement(share)
  })

  it('delega el segmento crudo al contrato de compartir sin preparación local', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { share, canShare: vi.fn().mockReturnValue(true) })
    vi.mocked(usePublicSegment).mockReturnValue({
      data: {
        ...segment,
        days: [
          {
            id: 'day-1',
            day: 1,
            blocks: [
              {
                type: 'image',
                content: 'data:image/png;base64,AAEC',
                file_name: 'lectura.png',
              },
              { type: 'video', content: 'https://youtube.com/watch?v=abc' },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as never)

    render(
      <MemoryRouter initialEntries={['/segmentos/november']}>
        <PublicSegmentDetailPage />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Compartir segmento' }))

    await waitFor(() => expect(share).toHaveBeenCalled())
    const shareData = share.mock.calls[0][0] as ShareData
    expect(shareData.title).toBe('Noviembre')
    expect(shareData.text).toBe('noviembre 2026\nhttps://youtube.com/watch?v=abc')
    expect(shareData.text).not.toContain('data:image')
    expect(shareData.files).toBeUndefined()
  })
})
