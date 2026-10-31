import { z } from 'zod'

export const announcementFormSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio'),
  description: z.string().trim().min(1, 'La descripción es obligatoria'),
  href: z
    .string()
    .trim()
    .refine(
      (value) => value.startsWith('/') || /^https:\/\//i.test(value),
      'Usa una ruta interna o una URL https.',
    ),
  image: z.instanceof(File).nullable().optional(),
})

export const announcementCreateFormSchema = announcementFormSchema.extend({
  image: z.instanceof(File, { message: 'La imagen es obligatoria' }),
})

export const announcementFormDefaults = {
  title: '',
  description: '',
  href: '',
  image: null,
} satisfies AnnouncementForm

export type AnnouncementForm = z.infer<typeof announcementFormSchema>
