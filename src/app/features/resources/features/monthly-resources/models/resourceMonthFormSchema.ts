import { z } from 'zod'

export const resourceMonthFormSchema = z.object({
  month: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Selecciona un mes válido.'),
  year: z.string().regex(/^\d{4}$/, 'Selecciona un año válido.'),
})

export type ResourceMonthFormInput = z.infer<typeof resourceMonthFormSchema>
export type ResourceMonthFormValues = { monthDate: string }
