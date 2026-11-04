import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { PublicSegmentList } from './PublicSegmentList'

vi.mock('./PublicSegmentGuideDialog', () => ({
  PublicSegmentGuideDialog: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('./SegmentCover', () => ({
  SegmentCover: () => <img alt="Portada de Enero" />,
}))

describe('PublicSegmentList', () => {
  it('shows a primary chevron without changing the card button accessibility', () => {
    render(
      <PublicSegmentList
        segments={[
          {
            id: 'segment-1',
            slug: 'enero-2026',
            title: 'Enero',
            month: 1,
            year: 2026,
            days: 31,
          },
        ]}
      />,
    )

    const card = screen.getByRole('button', { name: /Enero/ })
    expect(card).toBeEnabled()
    const chevron = card.querySelector('svg')
    expect(chevron).toHaveAttribute('aria-hidden', 'true')
    expect(chevron).toHaveClass('text-primary')
  })
})
