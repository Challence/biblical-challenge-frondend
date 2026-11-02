import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { PublicReadingGuideSection } from './PublicReadingGuideSection'

describe('PublicReadingGuideSection', () => {
  it('presenta una Card compacta que enlaza a la guía', () => {
    render(
      <MemoryRouter>
        <PublicReadingGuideSection />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: /Guía de lectura/i })
    expect(link).toHaveAttribute('href', '/guia')
    expect(link.parentElement).toHaveClass('h-24', 'sm:h-28', 'bg-gradient-to-br', 'from-primary')
    expect(link.parentElement).not.toHaveClass('aspect-[4/1]')
    expect(screen.getByRole('heading', { name: 'Guía de lectura' })).toBeVisible()
    expect(
      screen.getByText('Descubre la guía de lectura y acompaña tu reflexión diaria.'),
    ).toBeVisible()
    expect(link.querySelector('.rounded-full')).toHaveClass('size-11', 'bg-white', 'text-primary')
    expect(link.querySelector('button')).not.toBeInTheDocument()
  })
})
