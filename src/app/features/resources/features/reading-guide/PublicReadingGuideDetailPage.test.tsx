import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { PublicReadingGuideDetailPage } from './PublicReadingGuideDetailPage'
import * as service from './services/readingGuideService'

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useParams: () => ({ guideId: 'march' }),
}))
vi.mock('./services/readingGuideService', () => ({ getReadingGuide: vi.fn() }))

const guide = {
  id: 'march',
  monthDate: '2026-03',
  imagePath: 'march.webp',
  imageUrl: 'https://example.com/march.webp',
  createdBy: 'user-1',
  createdAt: '2026-03-01',
  updatedAt: '2026-03-01',
}

it('carga por ID y abre directamente la guía', async () => {
  vi.mocked(service.getReadingGuide).mockResolvedValue(guide)
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <PublicReadingGuideDetailPage />
      </QueryClientProvider>
    </MemoryRouter>,
  )

  const dialog = await screen.findByRole('dialog', { name: 'Guía de lectura de Marzo de 2026' })
  expect(within(dialog).getByRole('img')).toHaveAttribute('src', guide.imageUrl)
  expect(service.getReadingGuide).toHaveBeenCalledWith('march')
})
