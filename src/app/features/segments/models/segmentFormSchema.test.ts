import { describe, expect, it } from 'vitest'
import { normalizeSegmentFormValues, segmentFormSchema } from './segmentFormSchema'

describe('segment form values', () => {
  it('normalizes nullable remote block fields without dropping the selected day', () => {
    const values = normalizeSegmentFormValues({
      title: 'Segmento',
      month: 3,
      cover_path: null,
      segment_days: [{
        day: 2,
        segment_blocks: [{ position: 1, type: 'text', content: null, file_name: null }],
      }],
    })

    expect(segmentFormSchema.safeParse(values).success).toBe(true)
    expect(values.days).toHaveLength(1)
    expect(values.days[0].blocks[0]).toMatchObject({ value: '', name: undefined })
  })

  it('rejects a selected day without blocks', () => {
    const result = segmentFormSchema.safeParse({
      title: 'Segmento', month: 'Marzo', cover: '', days: [{ day: 2, blocks: [] }],
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Agrega al menos un bloque a cada día.')
  })
})
