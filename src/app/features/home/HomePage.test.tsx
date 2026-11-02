import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HomePage } from './HomePage'

vi.mock('@/app/features/announcements/public/PublicAnnouncementCarousel', () => ({
  PublicAnnouncementCarousel: () => <section aria-label="Carrusel de anuncios" />,
}))
vi.mock(
  '@/app/features/resources/features/reading-guide/shared/components/specialized/PublicReadingGuideSection',
  () => ({ PublicReadingGuideSection: () => <section aria-label="Guía de lectura" /> }),
)
vi.mock('@/app/features/segments/shared/components/specialized/PublicSegmentSection', () => ({
  PublicSegmentSection: () => <section aria-label="Lectura por mes" />,
}))

describe('HomePage', () => {
  it('presenta el contenido principal de la página', () => {
    render(<HomePage />)

    expect(screen.getByRole('region', { name: 'Carrusel de anuncios' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Guía de lectura' })).toBeVisible()
    expect(screen.getByRole('region', { name: 'Lectura por mes' })).toBeVisible()
  })
})
