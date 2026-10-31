export const ANNOUNCEMENT_IMAGE_VARIANTS = {
  desktop: { width: 1600, height: 400 },
  tablet: { width: 1024, height: 256 },
  mobile: { width: 768, height: 192 },
} as const

export const ANNOUNCEMENT_DESKTOP_IMAGE_SIZE = ANNOUNCEMENT_IMAGE_VARIANTS.desktop

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    const url = URL.createObjectURL(file)
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo procesar la imagen.'))
    }
    image.src = url
  })
}

export async function processAnnouncementImage(
  file: File,
): Promise<Record<keyof typeof ANNOUNCEMENT_IMAGE_VARIANTS, File>> {
  if (!file.type.startsWith('image/')) throw new Error('Selecciona un archivo de imagen válido.')
  const image = await loadImage(file)
  if (
    image.width !== ANNOUNCEMENT_DESKTOP_IMAGE_SIZE.width ||
    image.height !== ANNOUNCEMENT_DESKTOP_IMAGE_SIZE.height
  )
    throw new Error(
      `La imagen debe medir ${ANNOUNCEMENT_DESKTOP_IMAGE_SIZE.width} × ${ANNOUNCEMENT_DESKTOP_IMAGE_SIZE.height} px.`,
    )
  const result = {} as Record<keyof typeof ANNOUNCEMENT_IMAGE_VARIANTS, File>
  for (const [name, size] of Object.entries(ANNOUNCEMENT_IMAGE_VARIANTS) as Array<
    [keyof typeof ANNOUNCEMENT_IMAGE_VARIANTS, { width: number; height: number }]
  >) {
    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Tu navegador no permite procesar imágenes.')
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    const scale = Math.min(size.width / image.width, size.height / image.height)
    const width = image.width * scale
    const height = image.height * scale
    context.drawImage(image, (size.width - width) / 2, (size.height - height) / 2, width, height)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/webp', 0.92),
    )
    if (!blob) throw new Error('No se pudo generar una variante de imagen.')
    if (blob.type !== 'image/webp')
      throw new Error('Tu navegador no permite generar imágenes WebP.')
    result[name] = new File([blob], `${name}.webp`, { type: 'image/webp' })
  }
  return result
}
