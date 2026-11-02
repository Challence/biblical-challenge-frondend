import { describe, expect, it } from 'vitest'
import { resourceMonthFormSchema } from './resourceMonthFormSchema'

describe('resourceMonthFormSchema', () => {
  it('validates independent month and year selections', () => {
    expect(resourceMonthFormSchema.safeParse({ month: '01', year: '2024' }).success).toBe(true)
    expect(resourceMonthFormSchema.safeParse({ month: '13', year: '2024' }).success).toBe(false)
    expect(resourceMonthFormSchema.safeParse({ month: '01', year: '24' }).success).toBe(false)
  })
})
