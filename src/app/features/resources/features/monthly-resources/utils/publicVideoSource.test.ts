import { describe, expect, it } from 'vitest'
import { getPublicVideoSource } from './publicVideoSource'

describe('getPublicVideoSource', () => {
  it('convierte enlaces de YouTube y Vimeo en embeds', () => {
    expect(getPublicVideoSource('https://youtu.be/video123')).toEqual({
      type: 'embed',
      url: 'https://www.youtube.com/embed/video123',
    })
    expect(getPublicVideoSource('https://vimeo.com/123456')).toEqual({
      type: 'embed',
      url: 'https://player.vimeo.com/video/123456',
    })
  })

  it('distingue videos directos y enlaces externos', () => {
    expect(getPublicVideoSource('https://example.com/video.mp4')).toEqual({
      type: 'native',
      url: 'https://example.com/video.mp4',
    })
    expect(getPublicVideoSource('https://example.com/watch')).toEqual({
      type: 'external',
      url: 'https://example.com/watch',
    })
  })
})
