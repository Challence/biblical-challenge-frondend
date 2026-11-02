import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as requests from '../requests/readingGuideRequests'
import { createReadingGuide, updateReadingGuide } from './readingGuideService'

vi.mock('../requests/readingGuideRequests', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../requests/readingGuideRequests')>()
  return {
    ...actual,
    getReadingGuideRow: vi.fn(),
    uploadResourceAsset: vi.fn(),
    createReadingGuideRow: vi.fn(),
    updateReadingGuideRow: vi.fn(),
  }
})

describe('readingGuideService month validation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects an invalid month before uploading or creating', async () => {
    const imageFile = new File(['image'], 'guide.png', { type: 'image/png' })

    await expect(createReadingGuide({ monthDate: '2026-13', imageFile })).rejects.toThrow('El período debe tener el formato YYYY-MM.')

    expect(requests.uploadResourceAsset).not.toHaveBeenCalled()
    expect(requests.createReadingGuideRow).not.toHaveBeenCalled()
  })

  it('rejects an invalid month before reading, uploading, or updating', async () => {
    const imageFile = new File(['image'], 'guide.png', { type: 'image/png' })

    await expect(updateReadingGuide('guide-id', { monthDate: '2026-10-01', imageFile })).rejects.toThrow('El período debe tener el formato YYYY-MM.')

    expect(requests.getReadingGuideRow).not.toHaveBeenCalled()
    expect(requests.uploadResourceAsset).not.toHaveBeenCalled()
    expect(requests.updateReadingGuideRow).not.toHaveBeenCalled()
  })
})
