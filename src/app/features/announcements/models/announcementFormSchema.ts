import { z } from 'zod'

export const announcementFormSchema = z.object({
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
  href: '',
  image: null,
} satisfies AnnouncementForm

export type AnnouncementForm = z.infer<typeof announcementFormSchema>
