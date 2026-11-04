import '@testing-library/jest-dom/vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import * as service from './services/readingGuideService'
import { PublicReadingGuidePage } from './PublicReadingGuidePage'

vi.mock('./services/readingGuideService', () => ({ listReadingGuides: vi.fn() }))

const renderPage = () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <MemoryRouter>
      <QueryClientProvider client={client}>
        <PublicReadingGuidePage />
      </QueryClientProvider>
    </MemoryRouter>,
  )
}

const guide = (id: string, monthDate: string) => ({
  id,
  monthDate,
  imagePath: `${id}.webp`,
  imageUrl: `https://example.com/${id}.webp`,
  createdBy: 'user-1',
  createdAt: `${monthDate}-01`,
  updatedAt: `${monthDate}-01`,
})

describe('PublicReadingGuidePage', () => {
  it('muestra todas las guías desde la más reciente', async () => {
    vi.mocked(service.listReadingGuides).mockResolvedValue([
      guide('january', '2026-01'),
      guide('march', '2026-03'),
    ])

    renderPage()

    const images = await screen.findAllByRole('img')
    expect(images).toHaveLength(2)
    expect(images[0]).toHaveAccessibleName('Guía de lectura de Marzo de 2026')
    expect(images[0]).toHaveClass('h-48', 'sm:h-56', 'object-contain')
    expect(images[0]).not.toHaveClass('aspect-[3/4]')
    expect(images[1]).toHaveAccessibleName('Guía de lectura de Enero de 2026')
  })

  it('muestra el estado vacío', async () => {
    vi.mocked(service.listReadingGuides).mockResolvedValue([])

    renderPage()

    expect(await screen.findByText('No hay guías de lecturas agregadas')).toBeVisible()
    expect(screen.queryByRole('heading', { name: 'Guías de lectura' })).not.toBeInTheDocument()
    expect(screen.getByText('No hay guías de lecturas agregadas').closest('div')).toHaveClass(
      'items-center',
      'justify-center',
    )
  })

  it('abre y cierra una guía en pantalla completa', async () => {
    vi.mocked(service.listReadingGuides).mockResolvedValue([guide('march', '2026-03')])

    renderPage()
    const trigger = await screen.findByRole('link', {
      name: 'Ver guía de lectura de Marzo de 2026 en pantalla completa',
    })
    trigger.focus()
    // La tarjeta navega a la URL pública; el visor se prueba en la página de detalle.
    expect(trigger).toHaveAttribute('href', '/guia/march')
  })
})
