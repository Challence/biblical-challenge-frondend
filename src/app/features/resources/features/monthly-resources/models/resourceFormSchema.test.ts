import { describe, expect, it } from 'vitest'
import { resourceEditFormSchema, resourceFormSchema } from './resourceFormSchema'

describe('resourceFormSchema', () => {
  it('accepts HTTPS video URLs and rejects HTTP', () => {
    expect(
      resourceFormSchema.safeParse({
        type: 'video',
        title: 'Video',
        videoUrl: 'https://example.com/video',
      }).success,
    ).toBe(true)
    expect(
      resourceFormSchema.safeParse({
        type: 'video',
        title: 'Video',
        videoUrl: 'http://example.com/video',
      }).success,
    ).toBe(false)
  })

  it('requires a title and image when creating an image', () => {
    expect(
      resourceFormSchema.safeParse({
        type: 'image',
        title: 'Imagen',
        imageFile: new File([], 'image.png'),
      }).success,
    ).toBe(true)
    expect(
      resourceFormSchema.safeParse({
        type: 'image',
        title: ' ',
        imageFile: new File([], 'image.png'),
      }).success,
    ).toBe(false)
    expect(
      resourceFormSchema.safeParse({ type: 'image', title: 'Imagen', imageFile: null }).success,
    ).toBe(false)
  })

  it('allows editing an image without replacing its file', () => {
    expect(
      resourceEditFormSchema.safeParse({ type: 'image', title: 'Imagen', imageFile: null }).success,
    ).toBe(true)
  })
})
