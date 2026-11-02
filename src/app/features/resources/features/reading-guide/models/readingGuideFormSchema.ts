import { z } from 'zod'

export const readingGuideFormSchema = z.object({
  year: z.string().regex(/^\d{4}$/, 'Selecciona un año válido.'),
  month: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Selecciona un mes válido.'),
  imageFile: z.instanceof(File).nullable(),
})

export type ReadingGuideFormValues = z.infer<typeof readingGuideFormSchema>
