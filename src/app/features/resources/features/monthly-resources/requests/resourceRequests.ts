import { supabase } from '@/app/shared/lib/supabase'
import type {
  MonthlyResourceRemoteRow,
  ReadingGuideRemoteRow,
  ResourceInput,
  ResourceMonthInput,
  ResourceMonthRemoteRow,
} from '../models/resource'

export const RESOURCE_ASSETS_BUCKET = 'resource-assets'
function client() {
  if (!supabase) throw new Error('Supabase no está configurado.')
  return supabase
}
async function userId() {
  const user = (await client().auth.getUser()).data.user
  if (!user) throw new Error('Debes iniciar sesión.')
  return user.id
}
function pageRange(page: number, pageSize: number) {
  return [(page - 1) * pageSize, page * pageSize - 1] as const
}

export type ResourceMonthFilters = { month?: string; year?: string }

export async function listResourceMonthRows(
  page: number,
  pageSize: number,
  filters: ResourceMonthFilters = {},
) {
  const [from, to] = pageRange(page, pageSize)
  let query = client()
    .from('resource_months')
    .select('*', { count: 'exact' })
    .order('position')
    .order('id')
    .range(from, to)
  const month = filters.month?.trim()
  const year = filters.year?.trim()
  if (year && month) {
    const start = `${year}-${month.padStart(2, '0')}-01`
    const next = new Date(`${start}T00:00:00Z`)
    next.setUTCMonth(next.getUTCMonth() + 1)
    query = query.gte('month_date', start).lt('month_date', next.toISOString().slice(0, 10))
  } else if (year) {
    query = query.gte('month_date', `${year}-01-01`).lt('month_date', `${Number(year) + 1}-01-01`)
  } else if (month) {
    query = query
      .gte('month_date', `0001-${month.padStart(2, '0')}-01`)
      .lt('month_date', `9999-${month.padStart(2, '0')}-01`)
  }
  const { data, error, count } = await query
  if (error) throw error
  return { data: (data ?? []) as ResourceMonthRemoteRow[], count: count ?? 0 }
}
export async function listMonthlyResourceRows(
  monthId: string,
  page: number,
  pageSize: number,
  search: string,
) {
  const [from, to] = pageRange(page, pageSize)
  let query = client()
    .from('monthly_resources')
    .select('*', { count: 'exact' })
    .eq('resource_month_id', monthId)
    .order('position')
    .order('id')
    .range(from, to)
  if (search.trim())
    query = query.or(`video_url.ilike.%${search.trim()}%,image_path.ilike.%${search.trim()}%`)
  const { data, error, count } = await query
  if (error) throw error
  return { data: (data ?? []) as MonthlyResourceRemoteRow[], count: count ?? 0 }
}
export async function getResourceMonthRow(id: string) {
  const { data, error } = await client().from('resource_months').select('*').eq('id', id).single()
  if (error) throw error
  return data as ResourceMonthRemoteRow
}
export async function getMonthlyResourceRow(id: string) {
  const { data, error } = await client().from('monthly_resources').select('*').eq('id', id).single()
  if (error) throw error
  return data as MonthlyResourceRemoteRow
}
export async function updateResourceMonthRow(id: string, input: ResourceMonthInput) {
  const { data, error } = await client()
    .from('resource_months')
    .update({
      month_date: input.monthDate,
      ...(input.position === undefined ? {} : { position: input.position }),
    })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as ResourceMonthRemoteRow
}
export async function deleteResourceMonthRow(id: string) {
  const { error } = await client().from('resource_months').delete().eq('id', id)
  if (error) throw error
}
async function nextPosition(table: 'resource_months' | 'monthly_resources', monthId?: string) {
  let query = client()
    .from(table)
    .select('position')
    .order('position', { ascending: false })
    .limit(1)
  if (monthId) query = query.eq('resource_month_id', monthId)
  const { data, error } = await query
  if (error) throw error
  return ((data?.[0] as { position?: number } | undefined)?.position ?? -1) + 1
}
export async function createResourceMonthRow(input: ResourceMonthInput) {
  const position = input.position ?? (await nextPosition('resource_months'))
  const { data, error } = await client()
    .from('resource_months')
    .insert({ month_date: input.monthDate, position, created_by: await userId() })
    .select('*')
    .single()
  if (error) throw error
  return data as ResourceMonthRemoteRow
}
export async function createMonthlyResourceRow(
  monthId: string,
  input: ResourceInput,
  imagePath?: string,
) {
  const position = input.position ?? (await nextPosition('monthly_resources', monthId))
  const { data, error } = await client()
    .from('monthly_resources')
    .insert({
      resource_month_id: monthId,
      type: input.type,
      title: input.title ?? '',
      description: input.description ?? '',
      image_path: input.type === 'image' ? (imagePath ?? input.imagePath ?? null) : null,
      video_url: input.type === 'video' ? input.videoUrl : null,
      position,
      created_by: await userId(),
    })
    .select('*')
    .single()
  if (error) throw error
  return data as MonthlyResourceRemoteRow
}
export async function updateMonthlyResourceRow(
  id: string,
  input: ResourceInput,
  imagePath?: string,
) {
  const { data, error } = await client()
    .from('monthly_resources')
    .update({
      type: input.type,
      title: input.title ?? '',
      description: input.description ?? '',
      image_path: input.type === 'image' ? (imagePath ?? input.imagePath ?? null) : null,
      video_url: input.type === 'video' ? input.videoUrl : null,
      ...(input.position === undefined ? {} : { position: input.position }),
    })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as MonthlyResourceRemoteRow
}
export async function deleteMonthlyResourceRow(id: string) {
  const { error } = await client().from('monthly_resources').delete().eq('id', id)
  if (error) throw error
}
export async function reorderResourceMonth(id: string, position: number) {
  const { error } = await client().rpc('reorder_resource_month', {
    p_month_id: id,
    p_position: position,
  })
  if (error) throw error
}
export async function reorderMonthlyResource(id: string, position: number) {
  const { error } = await client().rpc('reorder_monthly_resource', {
    p_resource_id: id,
    p_position: position,
  })
  if (error) throw error
}
export async function uploadResourceAsset(file: File) {
  const path = `${await userId()}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const { error } = await client()
    .storage.from(RESOURCE_ASSETS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  return path
}
export function getResourceAssetUrl(path: string | null | undefined) {
  if (!path) return ''
  return client().storage.from(RESOURCE_ASSETS_BUCKET).getPublicUrl(path).data.publicUrl
}
export async function removeResourceAsset(path: string) {
  const { error } = await client().storage.from(RESOURCE_ASSETS_BUCKET).remove([path])
  if (error) throw error
}

export async function listReadingGuideRows() {
  const { data, error } = await client().from('reading_guides').select('*').order('month_date')
  if (error) throw error
  return (data ?? []) as ReadingGuideRemoteRow[]
}
export async function getReadingGuideRow(id: string) {
  const { data, error } = await client().from('reading_guides').select('*').eq('id', id).single()
  if (error) throw error
  return data as ReadingGuideRemoteRow
}
export async function createReadingGuideRow(monthDate: string, imagePath: string) {
  const { data, error } = await client()
    .from('reading_guides')
    .insert({ month_date: monthDate, image_path: imagePath, created_by: await userId() })
    .select('*')
    .single()
  if (error) throw error
  return data as ReadingGuideRemoteRow
}
export async function updateReadingGuideRow(id: string, monthDate: string, imagePath?: string) {
  const { data, error } = await client()
    .from('reading_guides')
    .update({ month_date: monthDate, ...(imagePath ? { image_path: imagePath } : {}) })
    .eq('id', id)
    .select('*')
    .single()
  if (error) throw error
  return data as ReadingGuideRemoteRow
}
export async function deleteReadingGuideRow(id: string) {
  const { error } = await client().from('reading_guides').delete().eq('id', id)
  if (error) throw error
}
