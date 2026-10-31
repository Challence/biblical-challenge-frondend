import { describe, expect, it } from 'vitest'
import { announcementCreateFormSchema, announcementFormSchema } from './announcementFormSchema'

const fields = { title: 'Título', description: 'Descripción', href: '/hoy' }

describe('announcement form schema', () => {
  it('requires an image when creating an announcement', () => {
    expect(announcementCreateFormSchema.safeParse(fields).success).toBe(false)
    expect(
      announcementCreateFormSchema.safeParse({ ...fields, image: new File(['image'], 'image.png') })
        .success,
    ).toBe(true)
  })

  it('allows editing without replacing the existing image', () => {
    expect(announcementFormSchema.safeParse(fields).success).toBe(true)
  })
})
