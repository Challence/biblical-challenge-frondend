import * as requests from '../requests/resourceRequests'
import type {
  MonthlyResource,
  Paginated,
  ReadingGuide,
  ReadingGuideInput,
  ResourceInput,
  ResourceMonth,
  ResourceMonthInput,
} from '../models/resource'

const mapMonth = (
  row: Awaited<ReturnType<typeof requests.getResourceMonthRow>>,
): ResourceMonth => ({
  id: row.id,
  monthDate: row.month_date,
  position: row.position,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})
const mapResource = (
  row: Awaited<ReturnType<typeof requests.getMonthlyResourceRow>>,
): MonthlyResource => ({
  id: row.id,
  resourceMonthId: row.resource_month_id,
  type: row.type,
  title: row.title,
  description: row.description,
  imagePath: row.image_path,
  imageUrl: requests.getResourceAssetUrl(row.image_path),
  videoUrl: row.video_url,
  position: row.position,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})
const pagination = (page: number, pageSize: number, total: number) => ({
  page,
  pageSize,
  total,
  totalPages: Math.max(1, Math.ceil(total / pageSize)),
})
const mapGuide = (row: Awaited<ReturnType<typeof requests.getReadingGuideRow>>): ReadingGuide => ({
  id: row.id,
  monthDate: row.month_date,
  imagePath: row.image_path,
  imageUrl: requests.getResourceAssetUrl(row.image_path),
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export async function listResourceMonths(
  page = 1,
  pageSize = 10,
  filters: requests.ResourceMonthFilters = {},
): Promise<Paginated<ResourceMonth>> {
  const result = await requests.listResourceMonthRows(page, pageSize, filters)
  return { items: result.data.map(mapMonth), ...pagination(page, pageSize, result.count) }
}
export async function listMonthlyResources(
  monthId: string,
  page = 1,
  pageSize = 10,
  search = '',
): Promise<Paginated<MonthlyResource>> {
  const result = await requests.listMonthlyResourceRows(monthId, page, pageSize, search)
  return { items: result.data.map(mapResource), ...pagination(page, pageSize, result.count) }
}
export async function getResourceMonth(id: string) {
  return mapMonth(await requests.getResourceMonthRow(id))
}
export async function getMonthlyResource(id: string) {
  return mapResource(await requests.getMonthlyResourceRow(id))
}
export async function createResourceMonth(input: ResourceMonthInput) {
  return mapMonth(await requests.createResourceMonthRow(input))
}
export async function updateResourceMonth(id: string, input: ResourceMonthInput) {
  return mapMonth(await requests.updateResourceMonthRow(id, input))
}
export async function deleteResourceMonth(id: string) {
  const resources = await requests.listMonthlyResourceRows(id, 1, 1000, '')
  await requests.deleteResourceMonthRow(id)
  const paths = resources.data
    .map((resource) => resource.image_path)
    .filter((path): path is string => Boolean(path))
  if (paths.length) {
    for (const path of paths) await requests.removeResourceAsset(path)
  }
}
export const reorderResourceMonth = requests.reorderResourceMonth

export async function createMonthlyResource(monthId: string, input: ResourceInput) {
  let path: string | undefined
  try {
    if (input.type === 'image' && input.imageFile)
      path = await requests.uploadResourceAsset(input.imageFile)
    return mapResource(await requests.createMonthlyResourceRow(monthId, input, path))
  } catch (error) {
    if (path) await requests.removeResourceAsset(path).catch(() => undefined)
    throw error
  }
}
export async function updateMonthlyResource(id: string, input: ResourceInput) {
  const old = await requests.getMonthlyResourceRow(id)
  const path =
    input.type === 'image' && input.imageFile
      ? await requests.uploadResourceAsset(input.imageFile)
      : undefined
  try {
    const result = await requests.updateMonthlyResourceRow(id, input, path)
    if (path && old.image_path && old.image_path !== path)
      await requests.removeResourceAsset(old.image_path)
    return mapResource(result)
  } catch (error) {
    if (path) await requests.removeResourceAsset(path).catch(() => undefined)
    throw error
  }
}
export async function deleteMonthlyResource(id: string) {
  const old = await requests.getMonthlyResourceRow(id)
  await requests.deleteMonthlyResourceRow(id)
  if (old.image_path) await requests.removeResourceAsset(old.image_path)
}
export const reorderMonthlyResource = requests.reorderMonthlyResource
export const uploadResourceAsset = requests.uploadResourceAsset
export const removeResourceAsset = requests.removeResourceAsset
export const resolveResourceAssetUrl = requests.getResourceAssetUrl

export async function listReadingGuides() {
  return (await requests.listReadingGuideRows()).map(mapGuide)
}
export async function createReadingGuide(input: ReadingGuideInput) {
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
