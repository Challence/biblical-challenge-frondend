import { describe, expect, it } from 'vitest'
import { getDaysValidationMessage } from './SegmentCalendarCard'

describe('getDaysValidationMessage', () => {
  it('keeps the empty-days message distinct from day block errors', () => {
    expect(getDaysValidationMessage({ message: 'Selecciona al menos un día.' })).toBe(
      'Selecciona al menos un día.',
    )
    expect(
      getDaysValidationMessage({
        0: { blocks: { message: 'Agrega al menos un bloque a cada día.' } },
      }),
    ).toBe('Agrega al menos un bloque a cada día.')
  })
})
