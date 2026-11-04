import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useContentShare } from './useContentShare'

const track = vi.fn()
vi.mock('@/app/shared/analytics/useAnalytics', () => ({ useAnalytics: () => ({ track }) }))

describe('useContentShare', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    Object.assign(navigator, { share: vi.fn().mockResolvedValue(undefined) })
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue({
        width: 10,
        height: 10,
        close: vi.fn(),
      }),
    )
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D)
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) =>
      callback(new Blob(['jpeg'], { type: 'image/jpeg' })),
    )
  })

  it('formats announcements with href and the public home URL', () => {
    const { result } = renderHook(() =>
      useContentShare({
        kind: 'announcement',
        data: {
          item: { href: 'https://example.com/anuncio' },
          title: 'Título ignorado',
          createdAt: '2026-01-01T00:00:00Z',
          videoUrl: 'https://www.youtube.com/watch?v=abc',
        },
      }),
    )

    expect(result.current.shareData).toMatchObject({
      title: 'Anuncio',
      text: 'Anuncio\n\nhttps://example.com/anuncio\n\nhttp://localhost:3000/',
    })
    expect(result.current.shareData).not.toHaveProperty('url')
  })

  it('formats announcements without href using only the public home URL', () => {
    const { result } = renderHook(() => useContentShare({ kind: 'announcement', data: {} }))

    expect(result.current.text).toBe('Anuncio\n\nhttp://localhost:3000/')
  })

  it('does not duplicate the public home URL when href matches it', () => {
    const { result } = renderHook(() =>
      useContentShare({
        kind: 'announcement',
        data: { item: { href: 'http://localhost:3000/' } },
      }),
    )

    expect(result.current.text).toBe('Anuncio\n\nhttp://localhost:3000/')
  })

  it('filters administrative URLs before passing share data to the native API', async () => {
    const nativeShare = vi.mocked(navigator.share)
    const data = { title: 'Recurso', url: '/recursos/123' }
    const { result } = renderHook(() =>
      useContentShare({
        kind: 'monthlyResource',
        publicUrl: '/admin/recursos/123',
        data,
      }),
    )

    await act(() => result.current.share())

    expect(result.current.shareData.url).not.toBeDefined()
    expect(nativeShare).toHaveBeenCalledWith(
      expect.not.objectContaining({ url: expect.anything() }),
    )
  })

  it('uses the public home for content without a URL on an administrative page', () => {
    window.history.replaceState({}, '', '/admin/anuncios')

    const { result } = renderHook(() =>
      useContentShare({ kind: 'readingGuide', data: { title: 'Guía' } }),
    )

    expect(result.current.shareData.url).toBe('http://localhost:3000/')
    expect(result.current.shareData.url).not.toContain('/admin')
  })

  it('never writes an administrative URL to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { share: undefined, clipboard: { writeText } })
    window.history.replaceState({}, '', '/admin/segmentos')
    const data = { title: 'Segmento' }
    const { result } = renderHook(() =>
      useContentShare({
        kind: 'segment',
        publicUrl: '/admin/segmentos/123',
        data,
      }),
    )

    await act(() => result.current.share())

    expect(writeText).toHaveBeenCalledWith('Segmento\n\nhttp://localhost:3000/')
    expect(writeText.mock.calls[0]?.[0]).not.toContain('/admin')
  })

  it('converts announcement images to JPEG files', async () => {
    const { result } = renderHook(() =>
      useContentShare({
        kind: 'announcement',
        data: { image: new File(['png'], 'original.png', { type: 'image/png' }) },
      }),
    )

    await vi.waitFor(() => expect(result.current.shareData.files).toHaveLength(1))
    expect(result.current.shareData.files?.[0]).toMatchObject({
      name: 'anuncio.jpg',
      type: 'image/jpeg',
    })
  })

  it('keeps the segment title when no date is supplied', () => {
    const { result } = renderHook(() =>
      useContentShare({ kind: 'segment', data: { title: 'Segmento', month: 2, year: 2026 } }),
    )

    expect(result.current.text).toBe('Segmento')
  })

  it('uses segmentTitle and includes period and day for daily readings', () => {
    const { result } = renderHook(() =>
      useContentShare({
        kind: 'dailyReading',
        data: { segmentTitle: 'Nuevo segmento', month: 3, year: 2026, dayNumber: 7 },
      }),
    )

    expect(result.current.title).toBe('Nuevo segmento')
    expect(result.current.text).toBe('01/Marzo/2026\nDía 7')
  })

  it('formats calendar dates for non-resource content without changing day labels', () => {
    const { result } = renderHook(() =>
      useContentShare({
        kind: 'readingGuide',
        data: { title: 'Guía', publishedAt: '2026-11-09T12:00:00Z' },
      }),
    )

    expect(result.current.text).toBe('09/Noviembre/2026')
    expect(result.current.text).not.toContain('2026-11-09')
  })

  it('formats monthly resources with normalized date, description, links, and JPEG image', async () => {
    const image = new File(['image'], 'cover.png', { type: 'image/png' })
    const { result } = renderHook(() =>
      useContentShare({
        kind: 'monthlyResource',
        data: {
          title: 'Recurso',
          image: image,
          videoUrl: 'https://www.youtube.com/watch?v=abc',
          url: '/recursos/recurso',
          date: '2026-03-07T00:00:00Z',
          description: 'Descripción del recurso',
        },
      }),
    )

    expect(result.current.text).toBe(
      'Recurso — 07/Marzo/2026\n\nDescripción del recurso\n\nhttps://www.youtube.com/watch?v=abc\nhttp://localhost:3000/recursos/recurso',
    )
    expect(result.current.shareData).not.toHaveProperty('url')
    await vi.waitFor(() => expect(result.current.shareData.files).toHaveLength(1))
  })

  it('uses the first day when a monthly resource only has month and year', () => {
    const { result } = renderHook(() =>
      useContentShare({
        kind: 'monthlyResource',
        data: { title: 'Recurso', monthDate: '2026-04', description: 'Descripción' },
      }),
    )

    expect(result.current.text).toBe('Recurso — 01/Abril/2026\n\nDescripción')
    expect(result.current.shareData).not.toHaveProperty('url')
  })

  it('collects images from raw image blocks without treating video URLs as files', async () => {
    const { result } = renderHook(() =>
      useContentShare({
        kind: 'dailyReading',
        data: {
          segmentTitle: 'Segmento',
          month: 3,
          year: 2026,
          day: 2,
          days: [
            {
              blocks: [
                { type: 'image', image: new File(['image'], 'day.webp', { type: 'image/webp' }) },
                { type: 'video', videoUrl: 'https://www.youtube.com/watch?v=abc' },
              ],
            },
          ],
        },
      }),
    )

    await vi.waitFor(() => expect(result.current.shareData.files).toHaveLength(1))
    expect(result.current.text).toContain('https://www.youtube.com/watch?v=abc')
  })
})
