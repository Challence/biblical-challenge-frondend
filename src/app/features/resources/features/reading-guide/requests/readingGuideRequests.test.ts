import { describe, expect, it } from 'vitest'
import { toDomainMonth, toPersistedMonthDate } from './readingGuideRequests'

describe('reading guide month persistence', () => {
  it('converts a domain month to the first day stored by Supabase', () => {
    expect(toPersistedMonthDate('2026-10')).toBe('2026-10-01')
  })

  it('converts a stored first-day date to a domain month', () => {
    expect(toDomainMonth('2026-10-01')).toBe('2026-10')
  })

  it.each(['2026-1', '2026-13', '2026-10-01', 'invalid'])('rejects invalid domain month %s', (month) => {
    expect(() => toPersistedMonthDate(month)).toThrow('El período debe tener el formato YYYY-MM.')
  })

  it.each(['2026-10', '2026-10-02', '2026-13-01', 'invalid'])('rejects invalid persisted month %s', (monthDate) => {
    expect(() => toDomainMonth(monthDate)).toThrow('El período almacenado debe tener el formato YYYY-MM-01.')
  })
})
