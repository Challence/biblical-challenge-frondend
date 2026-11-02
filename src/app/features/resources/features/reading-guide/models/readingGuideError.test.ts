import { describe, expect, it } from 'vitest'
import { getReadingGuideErrorMessage } from './readingGuideError'

describe('getReadingGuideErrorMessage', () => {
  it('maps a duplicated period without exposing Supabase details', () => {
    expect(
      getReadingGuideErrorMessage(
        {
          code: '23505',
          message: 'duplicate key violates constraint reading_guides_month_date_key',
        },
        'save',
      ),
    ).toBe('Ya existe una guía para el período seleccionado.')
  })

  it.each([
    { code: '22007', message: 'invalid input syntax for type date' },
    new Error('El período debe tener el formato YYYY-MM.'),
  ])('maps invalid remote and local periods', (error) => {
    expect(getReadingGuideErrorMessage(error, 'save')).toBe('El período seleccionado no es válido.')
  })

  it('maps a missing session', () => {
    expect(getReadingGuideErrorMessage(new Error('Debes iniciar sesión.'), 'delete')).toBe(
      'Tu sesión no está disponible. Inicia sesión nuevamente.',
    )
  })

  it('uses safe contextual fallbacks', () => {
    expect(getReadingGuideErrorMessage(new Error('private bucket/path failed'), 'load')).toBe(
      'No se pudieron cargar las guías. Inténtalo de nuevo.',
    )
    expect(getReadingGuideErrorMessage({ details: 'sensitive SQL details' }, 'delete')).toBe(
      'No se pudo eliminar la guía. Inténtalo de nuevo.',
    )
  })
})
