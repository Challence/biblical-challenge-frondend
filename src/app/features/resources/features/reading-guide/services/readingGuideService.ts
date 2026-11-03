import * as requests from '../requests/readingGuideRequests'
import type { ReadingGuide, ReadingGuideInput } from '../models/readingGuide'

const mapGuide = (row: Awaited<ReturnType<typeof requests.getReadingGuideRow>>): ReadingGuide => ({
  id: row.id,
  monthDate: row.month_date,
  imagePath: row.image_path,
  imageUrl: requests.getResourceAssetUrl(row.image_path),
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})
export async function listReadingGuides() {
  return (await requests.listReadingGuideRows()).map(mapGuide)
}
export async function createReadingGuide(input: ReadingGuideInput) {
  requests.toPersistedMonthDate(input.monthDate)
  if (!input.imageFile) throw new Error('La imagen es obligatoria.')
  const path = await requests.uploadResourceAsset(input.imageFile)
  try {
    return mapGuide(await requests.createReadingGuideRow(input.monthDate, path))
  } catch (error) {
    await requests.removeResourceAsset(path).catch(() => undefined)
    throw error
  }
}
export async function updateReadingGuide(id: string, input: ReadingGuideInput) {
  requests.toPersistedMonthDate(input.monthDate)
  const old = await requests.getReadingGuideRow(id)
  const path = input.imageFile ? await requests.uploadResourceAsset(input.imageFile) : undefined
  try {
    const result = mapGuide(await requests.updateReadingGuideRow(id, input.monthDate, path))
    if (path) await requests.removeResourceAsset(old.image_path)
    return result
  } catch (error) {
    if (path) await requests.removeResourceAsset(path).catch(() => undefined)
    throw error
  }
}
export async function deleteReadingGuide(id: string) {
  const old = await requests.getReadingGuideRow(id)
  await requests.deleteReadingGuideRow(id)
  await requests.removeResourceAsset(old.image_path)
}
