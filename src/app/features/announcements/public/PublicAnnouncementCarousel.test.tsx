import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PublicAnnouncementCarousel } from './PublicAnnouncementCarousel'

const navigate = vi.fn()
const track = vi.fn()
const announcement = {
  id: 'announcement-42',
  imagePath: undefined,
  imageDesktopPath: undefined,
  imageTabletPath: undefined,
  imageMobilePath: undefined,
  href: '/lectura/42',
  active: true,
  position: 0,
  createdBy: 'user-1',
  createdAt: '2026-11-01',
  updatedAt: '2026-11-01',
}

vi.mock('react-router-dom', () => ({ useNavigate: () => navigate }))
vi.mock('@/app/shared/analytics/useAnalytics', () => ({ useAnalytics: () => ({ track }) }))
vi.mock('../services/announcementService', () => ({
  listPublicAnnouncements: vi.fn(async () => [announcement]),
  resolveAnnouncementImageUrl: vi.fn((path?: string) => path),
}))

describe('PublicAnnouncementCarousel', () => {
  const renderCarousel = () =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <PublicAnnouncementCarousel />
      </QueryClientProvider>,
    )

  beforeEach(() => {
    navigate.mockReset()
    track.mockReset()
  })

  it('emite el anuncio correcto una sola vez por clic y conserva la navegación', async () => {
    renderCarousel()

    const link = await screen.findByLabelText('Abrir anuncio')
    expect(screen.queryByLabelText('Compartir anuncio')).not.toBeInTheDocument()
    fireEvent.click(link)

    expect(track).toHaveBeenCalledTimes(1)
    expect(track).toHaveBeenCalledWith({
      type: 'announcement_clicked',
      announcementId: 'announcement-42',
    })
    expect(navigate).toHaveBeenCalledWith('/lectura/42')
  })

  it('navega aunque falle la analítica', async () => {
    track.mockImplementation(() => {
      throw new Error('analytics unavailable')
    })
    renderCarousel()

    fireEvent.click(await screen.findByLabelText('Abrir anuncio'))

    expect(navigate).toHaveBeenCalledWith('/lectura/42')
  })
})
