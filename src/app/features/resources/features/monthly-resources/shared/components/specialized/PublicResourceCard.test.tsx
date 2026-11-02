import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { MonthlyResource } from '../../../models/resource'
import { PublicResourceCard } from './PublicResourceCard'

const resource = (overrides: Partial<MonthlyResource>): MonthlyResource => ({
  id: 'resource-1',
  resourceMonthId: 'month-1',
  type: 'image',
  title: 'Recurso mensual',
  description: 'Descripción',
  imagePath: 'resource.webp',
  imageUrl: 'https://example.com/resource.webp',
  videoUrl: null,
  position: 0,
  createdBy: 'user-1',
  createdAt: '2026-11-01',
  updatedAt: '2026-11-01',
  ...overrides,
})

describe('PublicResourceCard', () => {
  it('abre una imagen en pantalla completa', () => {
    render(<PublicResourceCard resource={resource({})} />)

    fireEvent.click(screen.getByRole('button', { name: 'Ver Recurso mensual en pantalla completa' }))
    const dialog = screen.getByRole('dialog', { name: 'Recurso mensual' })
    expect(
      within(dialog).getByRole('img', { name: 'Recurso mensual en pantalla completa' }),
    ).toHaveClass('object-contain')
  })

  it('abre un video de YouTube embebido en pantalla completa', () => {
    render(
      <PublicResourceCard
        resource={resource({
          type: 'video',
          imagePath: undefined,
          imageUrl: undefined,
          videoUrl: 'https://youtu.be/video123',
        })}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ver Recurso mensual en pantalla completa' }))
    expect(screen.getByTitle('Recurso mensual')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/video123',
    )
  })
})
