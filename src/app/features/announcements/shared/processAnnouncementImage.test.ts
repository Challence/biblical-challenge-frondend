import { describe, expect, it } from 'vitest'
import {
  ANNOUNCEMENT_DESKTOP_IMAGE_SIZE,
  ANNOUNCEMENT_IMAGE_VARIANTS,
} from './processAnnouncementImage'

describe('announcement image variants', () => {
  it('uses the fixed 16:7 responsive dimensions', () => {
    expect(ANNOUNCEMENT_IMAGE_VARIANTS).toEqual({
      desktop: { width: 1600, height: 400 },
      tablet: { width: 1024, height: 256 },
      mobile: { width: 768, height: 192 },
    })
  })

  it('uses desktop as the required source size', () => {
    expect(ANNOUNCEMENT_DESKTOP_IMAGE_SIZE).toEqual({ width: 1600, height: 400 })
  })
})
