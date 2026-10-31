export const ANNOUNCEMENT_IMAGE_VARIANTS = {
  desktop: { width: 1600, height: 700 },
  tablet: { width: 1024, height: 448 },
  mobile: { width: 768, height: 336 },
} as const

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
  const result = {} as Record<keyof typeof ANNOUNCEMENT_IMAGE_VARIANTS, File>
  for (const [name, size] of Object.entries(ANNOUNCEMENT_IMAGE_VARIANTS) as Array<
    [keyof typeof ANNOUNCEMENT_IMAGE_VARIANTS, { width: number; height: number }]
  >) {
    const canvas = document.createElement('canvas')
    canvas.width = size.width
    canvas.height = size.height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Tu navegador no permite procesar imágenes.')
    const scale = Math.max(size.width / image.width, size.height / image.height)
    const width = image.width * scale
    const height = image.height * scale
    context.drawImage(image, (size.width - width) / 2, (size.height - height) / 2, width, height)
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.88),
    )
    if (!blob) throw new Error('No se pudo generar una variante de imagen.')
    result[name] = new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
  }
  return result
}
