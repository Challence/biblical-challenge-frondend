import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SegmentBlockRenderer } from './SegmentBlockRenderer'

describe('SegmentBlockRenderer', () => {
  it.each([
    ['https://www.youtube.com/watch?v=abc123', 'https://www.youtube.com/embed/abc123'],
    ['https://youtu.be/abc123', 'https://www.youtube.com/embed/abc123'],
  ])('converts YouTube URL %s to an embed source', (url, expectedSource) => {
    render(<SegmentBlockRenderer block={{ type: 'video', content: url }} />)

    const iframe = screen.getByTitle('Video de la lectura')
    expect(iframe).toHaveAttribute('src', expectedSource)
    expect(iframe).toHaveAttribute('loading', 'lazy')
    expect(iframe).toHaveAttribute('allowfullscreen')
  })

  it('keeps non-YouTube URLs as the iframe source', () => {
    render(
      <SegmentBlockRenderer
        block={{ type: 'video', content: 'https://videos.example.test/lesson.mp4' }}
      />,
    )

    expect(screen.getByTitle('Video de la lectura')).toHaveAttribute(
      'src',
      'https://videos.example.test/lesson.mp4',
    )
  })
})
