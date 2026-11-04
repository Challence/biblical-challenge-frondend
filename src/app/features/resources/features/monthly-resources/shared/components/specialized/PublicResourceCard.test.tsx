import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { MonthlyResource } from '../../../models/resource'
import { PublicResourceCard } from './PublicResourceCard'

const track = vi.fn()
vi.mock('@/app/shared/analytics/useAnalytics', () => ({
  useAnalytics: () => ({ track }),
}))

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
  beforeEach(() => track.mockClear())

  function openYouTubeResource() {
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
    fireEvent.click(
      screen.getByRole('button', { name: 'Ver Recurso mensual en pantalla completa' }),
    )
    return screen.getByTitle('Recurso mensual') as HTMLIFrameElement
  }

  function dispatchYouTubePlayback(
    frame: HTMLIFrameElement,
    options: Partial<MessageEventInit> = {},
  ) {
    window.dispatchEvent(
      new MessageEvent('message', {
        source: frame.contentWindow,
        origin: 'https://www.youtube.com',
        data: JSON.stringify({ event: 'onStateChange', info: 1 }),
        ...options,
      }),
    )
  }

  it('abre una imagen en pantalla completa', () => {
    render(<PublicResourceCard resource={resource({})} />)

    fireEvent.click(
      screen.getByRole('button', { name: 'Ver Recurso mensual en pantalla completa' }),
    )
    const dialog = screen.getByRole('dialog', { name: 'Recurso mensual' })
    expect(
      within(dialog).getByRole('img', { name: 'Recurso mensual en pantalla completa' }),
    ).toHaveClass('object-contain')
    expect(track).toHaveBeenCalledWith({
      type: 'resource_viewed',
      resourceId: 'resource-1',
      resourceType: 'image',
    })
  })

  it('usa una composición compacta horizontal en móvil y vertical desde tablet', () => {
    render(<PublicResourceCard resource={resource({})} />)

    const trigger = screen.getByRole('button', {
      name: 'Ver Recurso mensual en pantalla completa',
    })
    const card = trigger.querySelector('[class*="h-32"]')
    const thumbnail = card?.firstElementChild
    const content = card?.lastElementChild

    expect(card).toHaveClass('flex', 'h-32', 'flex-row', 'sm:block', 'sm:h-full')
    expect(thumbnail).toHaveClass('h-full', 'w-28', 'shrink-0', 'sm:aspect-video', 'sm:w-auto')
    expect(content).toHaveClass('min-w-0', 'flex-1', 'overflow-hidden', 'sm:flex-none')
    expect(within(trigger).getByRole('img', { name: 'Recurso mensual' })).toHaveClass(
      'size-full',
      'object-cover',
    )
  })

  it('no duplica aperturas inmediatas', () => {
    render(<PublicResourceCard resource={resource({})} />)
    const trigger = screen.getByRole('button', { name: 'Ver Recurso mensual en pantalla completa' })
    fireEvent.click(trigger)
    fireEvent.click(trigger)
    expect(track).toHaveBeenCalledTimes(1)
  })

  it('abre un video de YouTube embebido en pantalla completa', () => {
    const frame = openYouTubeResource()
    expect(screen.getByTitle('Recurso mensual')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/video123?enablejsapi=1&origin=http%3A%2F%2Flocalhost%3A3000',
    )
    expect(track).toHaveBeenCalledTimes(1)
    fireEvent.load(frame)
    expect(track).toHaveBeenCalledTimes(1)
    dispatchYouTubePlayback(frame)
    expect(track).toHaveBeenCalledWith({
      type: 'video_viewed',
      resourceId: 'resource-1',
      watchedSeconds: 0,
    })
  })

  it('ignora mensajes de orígenes, fuentes y estructuras ajenas', () => {
    const frame = openYouTubeResource()
    dispatchYouTubePlayback(frame, { origin: 'https://attacker.example' })
    dispatchYouTubePlayback(frame, {
      source: window,
      data: JSON.stringify({ event: 'onStateChange', info: 1 }),
    })
    dispatchYouTubePlayback(frame, { data: JSON.stringify({ event: 'onStateChange', info: '1' }) })
    dispatchYouTubePlayback(frame, { data: '{invalid json' })

    expect(track).toHaveBeenCalledTimes(1)
  })

  it('limpia el listener al cerrar y registra una sola vez tras reabrir', () => {
    const frame = openYouTubeResource()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar recurso' }))
    dispatchYouTubePlayback(frame)
    expect(track).toHaveBeenCalledTimes(1)

    fireEvent.click(
      screen.getByRole('button', { name: 'Ver Recurso mensual en pantalla completa' }),
    )
    const reopenedFrame = screen.getByTitle('Recurso mensual') as HTMLIFrameElement
    dispatchYouTubePlayback(reopenedFrame)
    dispatchYouTubePlayback(reopenedFrame)
    expect(track).toHaveBeenCalledTimes(2)
    expect(track).toHaveBeenLastCalledWith({
      type: 'video_viewed',
      resourceId: 'resource-1',
      watchedSeconds: 0,
    })
  })

  it('limpia el listener al desmontar', () => {
    const { unmount } = render(
      <PublicResourceCard
        resource={resource({
          type: 'video',
          imagePath: undefined,
          imageUrl: undefined,
          videoUrl: 'https://youtu.be/video123',
        })}
      />,
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Ver Recurso mensual en pantalla completa' }),
    )
    const frame = screen.getByTitle('Recurso mensual') as HTMLIFrameElement
    unmount()
    dispatchYouTubePlayback(frame)

    expect(track).toHaveBeenCalledTimes(1)
  })

  it('mide reproducción observable de video nativo', () => {
    render(
      <PublicResourceCard
        resource={resource({
          type: 'video',
          imageUrl: undefined,
          videoUrl: 'https://example.com/video.mp4',
        })}
      />,
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Ver Recurso mensual en pantalla completa' }),
    )
    const video = document.querySelector('video') as HTMLVideoElement
    fireEvent.play(video)
    expect(track).toHaveBeenCalledWith({
      type: 'video_viewed',
      resourceId: 'resource-1',
      watchedSeconds: 0,
    })
  })

  it('conserva el enlace externo sin fingir reproducción', () => {
    render(
      <PublicResourceCard
        resource={resource({
          type: 'video',
          imageUrl: undefined,
          videoUrl: 'https://example.com/watch',
        })}
      />,
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Ver Recurso mensual en pantalla completa' }),
    )
    expect(screen.getByRole('link', { name: /Abrir video/ })).toHaveAttribute(
      'href',
      'https://example.com/watch',
    )
    expect(track).toHaveBeenCalledTimes(1)
  })
})
