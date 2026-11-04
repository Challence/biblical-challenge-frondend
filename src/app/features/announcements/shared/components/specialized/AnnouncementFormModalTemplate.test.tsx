import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Announcement } from '../../../models/announcement'
import { useAnnouncementAdmin } from '../../../hooks/useAnnouncementAdmin'
import { AnnouncementFormModalTemplate } from './AnnouncementFormModalTemplate'
import * as service from '../../../services/announcementService'

vi.mock('../../../services/announcementService', () => ({
  listAnnouncements: vi.fn(),
  updateAnnouncement: vi.fn(),
  removeAnnouncementImages: vi.fn(),
}))

const announcement: Announcement = {
  id: 'announcement-1',
  href: '/anuncio',
  imagePath: 'announcement.webp',
  imageDesktopPath: 'announcement-desktop.webp',
  imageTabletPath: 'announcement-tablet.webp',
  imageMobilePath: 'announcement-mobile.webp',
  active: true,
  position: 0,
  createdBy: 'user-1',
  createdAt: '2026-11-03T00:00:00.000Z',
  updatedAt: '2026-11-03T00:00:00.000Z',
}

function SaveForm({
  onGlobalError,
  onConfirm,
}: {
  onGlobalError: (error: unknown) => void
  onConfirm: () => void
}) {
  const admin = useAnnouncementAdmin(1, '', onGlobalError)

  return (
    <AnnouncementFormModalTemplate
      data={{
        announcement,
        save: (item, values) => admin.save.mutateAsync({ announcement: item, values }),
      }}
      confirm={onConfirm}
      close={vi.fn()}
      dismiss={vi.fn()}
    />
  )
}

describe('AnnouncementFormModalTemplate save errors', () => {
  it('keeps a failed save inline without queuing a global alert and closes after a later success', async () => {
    const saveError = new Error('No se pudo guardar el anuncio')
    vi.mocked(service.listAnnouncements).mockResolvedValue({
      items: [announcement],
      page: 1,
      pageSize: 12,
      total: 1,
      totalPages: 1,
    })
    vi.mocked(service.updateAnnouncement)
      .mockRejectedValueOnce(saveError)
      .mockResolvedValueOnce(announcement)
    vi.mocked(service.removeAnnouncementImages).mockResolvedValue(undefined)
    const onGlobalError = vi.fn()
    const onConfirm = vi.fn()

    render(
      <QueryClientProvider
        client={
          new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
          })
        }
      >
        <SaveForm onGlobalError={onGlobalError} onConfirm={onConfirm} />
      </QueryClientProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Guardar anuncio' }))

    expect((await screen.findByRole('alert')).textContent).toBe(saveError.message)
    expect(onGlobalError).not.toHaveBeenCalled()
    expect(onConfirm).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Guardar anuncio' }))

    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1))
    expect(onGlobalError).not.toHaveBeenCalled()
    expect(service.updateAnnouncement).toHaveBeenCalledTimes(2)
  })
})
