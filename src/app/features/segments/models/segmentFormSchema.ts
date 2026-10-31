import { z } from 'zod'

export const segmentFormSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio.'),
  month: z.string().min(1, 'Selecciona un mes.'),
  cover: z.string().optional(),
  days: z.array(z.object({
    day: z.number().int().min(1).max(31),
    blocks: z.array(z.object({
      id: z.string(), type: z.enum(['text', 'image', 'video']), value: z.string(), name: z.string().optional(),
    })).min(1),
  })).min(1, 'Selecciona al menos un día.'),
})
export type SegmentFormValues = z.infer<typeof segmentFormSchema>
