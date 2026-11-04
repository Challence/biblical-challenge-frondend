import { describe, expect, it } from 'vitest'
import { normalizeSegmentFormValues, segmentFormSchema } from './segmentFormSchema'

describe('segment form values', () => {
  it('normalizes nullable remote block fields without dropping the selected day', () => {
    const values = normalizeSegmentFormValues({
      title: 'Segmento',
      month: 3,
      year: 2024,
      cover_path: null,
      segment_days: [
        {
          day: 2,
          segment_blocks: [{ position: 1, type: 'text', content: null, file_name: null }],
        },
      ],
    })

    expect(segmentFormSchema.safeParse(values).success).toBe(true)
    expect(values.days).toHaveLength(1)
    expect(values.days[0].blocks[0]).toMatchObject({ value: '', name: undefined })
  })

  it('rejects a selected day without blocks', () => {
    const result = segmentFormSchema.safeParse({
      title: 'Segmento',
      month: 'Marzo',
      year: 2024,
      cover: '',
      days: [{ day: 2, blocks: [] }],
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('Agrega al menos un bloque a cada día.')
  })

  it('rejects years outside the supported segment range', () => {
    const result = segmentFormSchema.safeParse({
      title: 'Segmento',
      month: 'Marzo',
      year: 1999,
      cover: '',
      days: [{ day: 2, blocks: [{ id: '2-1', type: 'text', value: 'Contenido' }] }],
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toBe('El año debe estar entre 2000 y 2200.')
  })
})
