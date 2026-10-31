import { describe, expect, it } from 'vitest'
import { ANNOUNCEMENT_IMAGE_VARIANTS } from './processAnnouncementImage'

describe('announcement image variants', () => {
  it('uses the fixed 16:7 responsive dimensions', () => {
    expect(ANNOUNCEMENT_IMAGE_VARIANTS).toEqual({
      desktop: { width: 1600, height: 700 },
      tablet: { width: 1024, height: 448 },
      mobile: { width: 768, height: 336 },
    })
  })
})
