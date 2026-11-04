import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useContentShare } from './useContentShare'

const track = vi.fn()
vi.mock('@/app/shared/analytics/useAnalytics', () => ({ useAnalytics: () => ({ track }) }))

describe('useContentShare', () => {
  beforeEach(() => {
    Object.assign(navigator, { share: vi.fn().mockResolvedValue(undefined) })
  })

  it('normalizes segment month/year when no date is supplied', () => {
    const { result } = renderHook(() =>
      useContentShare({ kind: 'segment', data: { title: 'Segmento', month: 2, year: 2026 } }),
    )

    expect(result.current.text).toBe('febrero 2026')
  })

  it('uses segmentTitle and includes period and day for daily readings', () => {
    const { result } = renderHook(() =>
      useContentShare({
        kind: 'dailyReading',
        data: { segmentTitle: 'Nuevo segmento', month: 3, year: 2026, dayNumber: 7 },
      }),
    )

    expect(result.current.title).toBe('Nuevo segmento')
    expect(result.current.text).toBe('marzo 2026\nDía 7')
  })

  it('prepares raw resource image files and keeps only YouTube URLs in text', async () => {
    const image = new File(['image'], 'cover.png', { type: 'image/png' })
    const { result } = renderHook(() =>
      useContentShare({
        kind: 'monthlyResource',
        data: {
          title: 'Recurso',
          image: image,
          videoUrl: 'https://www.youtube.com/watch?v=abc',
          description: 'data:image/png;base64,AAAA',
        },
      }),
    )

    expect(result.current.text).toBe('https://www.youtube.com/watch?v=abc')
    await vi.waitFor(() => expect(result.current.shareData.files).toHaveLength(1))
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
