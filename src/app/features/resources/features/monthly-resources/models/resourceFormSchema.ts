import { z } from 'zod'

const resourceFormSchemaBase = (editing: boolean) =>
  z.discriminatedUnion('type', [
    z.object({
      type: z.literal('image'),
      title: z.string().trim().min(1, 'El título es obligatorio.'),
      description: z.string().trim().optional(),
      imageFile: editing
        ? z.instanceof(File).nullable().optional()
        : z.instanceof(File, { message: 'La imagen es obligatoria.' }),
    }),
    z.object({
      type: z.literal('video'),
      title: z.string().trim().min(1, 'El título es obligatorio.'),
      description: z.string().trim().optional(),
      videoUrl: z
        .string()
        .url('Introduce una URL válida.')
        .refine((value) => value.startsWith('https://'), 'La URL debe usar HTTPS.'),
    }),
  ])

export const resourceFormSchema = resourceFormSchemaBase(false)
export const resourceEditFormSchema = resourceFormSchemaBase(true)

export type ResourceFormValues = z.infer<typeof resourceFormSchema>
