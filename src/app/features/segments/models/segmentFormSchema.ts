import { z } from 'zod'
import { SEGMENT_MONTHS } from './segmentCatalog'

export const segmentFormSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio.'),
  month: z.string().min(1, 'Selecciona un mes.'),
  cover: z.string().optional(),
  days: z.array(z.object({
    day: z.number().int().min(1).max(31),
    blocks: z.array(z.object({
      id: z.string(), type: z.enum(['text', 'image', 'video']), value: z.string(), name: z.string().optional(),
    })).min(1, 'Agrega al menos un bloque a cada día.'),
  })).min(1, 'Selecciona al menos un día.'),
})
export type SegmentFormValues = z.infer<typeof segmentFormSchema>

type SegmentForForm = {
  title: string
  month: number
  cover_path: string | null
  segment_days: Array<{
    day: number
    segment_blocks: Array<{
      position: number
      type: SegmentFormValues['days'][number]['blocks'][number]['type']
      content: string | null
      file_name: string | null
    }>
  }>
}

export function normalizeSegmentFormValues(data: SegmentForForm): SegmentFormValues {
  return {
    title: data.title,
    month: SEGMENT_MONTHS[data.month - 1] ?? '',
    cover: data.cover_path ?? '',
    days: data.segment_days.map((day) => ({
      day: day.day,
      blocks: [...day.segment_blocks]
        .sort((a, b) => a.position - b.position)
        .map((block) => ({
          id: `${day.day}-${block.position}`,
          type: block.type,
          value: block.content ?? '',
          name: block.file_name ?? undefined,
        })),
    })),
  }
}
