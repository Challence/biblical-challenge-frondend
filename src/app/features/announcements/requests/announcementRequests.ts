import { supabase } from '@/app/shared/lib/supabase'

import type { AnnouncementInput, AnnouncementRemoteRow } from '../models/announcement'
import { ANNOUNCEMENT_BUCKET } from '../models/announcementCatalog'

type AnnouncementWriteRow = {
  title: string
  description: string
  image_path: string | null
  image_desktop_path: string | null
  image_tablet_path: string | null
  image_mobile_path: string | null
  href: string | null
  active: boolean
  position: number
}

type AnnouncementCreateRow = AnnouncementWriteRow & {
  created_by: string
}

type AnnouncementListResult = {
  data: AnnouncementRemoteRow[]
  count: number
}

export function getAnnouncementImageUrl(path: string | null | undefined): string {
  if (!path || !supabase) return ''
  return supabase.storage.from(ANNOUNCEMENT_BUCKET).getPublicUrl(path).data.publicUrl
}

function client() {
  if (!supabase) throw new Error('Supabase no está configurado.')
  return supabase
}

async function userId(): Promise<string> {
  const { data } = await client().auth.getUser()
  if (!data.user) throw new Error('Debes iniciar sesión.')
  return data.user.id
}

function writeRow(input: AnnouncementInput): AnnouncementWriteRow {
  return {
    title: input.title.trim(),
    description: input.description,
    image_path: input.imagePath ?? null,
    image_desktop_path: input.imageDesktopPath ?? null,
    image_tablet_path: input.imageTabletPath ?? null,
    image_mobile_path: input.imageMobilePath ?? null,
    href: input.href ?? null,
    active: input.active ?? false,
    position: input.position ?? 0,
  }
}

export async function listAnnouncementRows(
  page: number,
  pageSize: number,
  search: string,
): Promise<AnnouncementListResult> {
  const from = (page - 1) * pageSize
  let query = client()
    .from('announcements')
    .select('*', { count: 'exact' })
    .order('position')
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1)

  if (search.trim()) query = query.ilike('title', `%${search.trim()}%`)

  const { data, error, count } = await query
  if (error) throw error

  return {
    data: (data ?? []) as AnnouncementRemoteRow[],
    count: count ?? 0,
  }
}

export async function listPublicAnnouncementRows(): Promise<AnnouncementRemoteRow[]> {
  const { data, error } = await client()
    .from('announcements')
    .select('*')
    .eq('active', true)
    .order('position')

  if (error) throw error
  return (data ?? []) as AnnouncementRemoteRow[]
}

export async function getAnnouncementRow(id: string): Promise<AnnouncementRemoteRow> {
  const { data, error } = await client().from('announcements').select('*').eq('id', id).single()
  if (error) throw error
  return data as AnnouncementRemoteRow
}

export async function createAnnouncementRow(
  input: AnnouncementInput,
): Promise<AnnouncementRemoteRow> {
  const row: AnnouncementCreateRow = { ...writeRow(input), created_by: await userId() }
  const { data, error } = await client().from('announcements').insert(row).select('*').single()
  if (error) throw error
  return data as AnnouncementRemoteRow
}

export async function updateAnnouncementRow(
  id: string,
  input: AnnouncementInput,
): Promise<AnnouncementRemoteRow> {
  const { data, error } = await client()
    .from('announcements')
    .update(writeRow(input))
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data as AnnouncementRemoteRow
}

export async function deleteAnnouncementRow(id: string): Promise<void> {
  const { error } = await client().from('announcements').delete().eq('id', id)
  if (error) throw error
}

export async function setAnnouncementActive(id: string, active: boolean): Promise<void> {
  const { error } = await client().from('announcements').update({ active }).eq('id', id)
  if (error) throw error
}

export async function reorderAnnouncements(
  items: Array<{ id: string; position: number }>,
): Promise<void> {
  for (const item of items) {
    const { error } = await client()
      .from('announcements')
      .update({ position: item.position })
      .eq('id', item.id)
    if (error) throw error
  }
}

export async function uploadAnnouncementImage(file: File, path: string): Promise<string> {
  const safePath = `${await userId()}/${path.replace(/^\//, '')}`
  const { error } = await client()
    .storage.from(ANNOUNCEMENT_BUCKET)
    .upload(safePath, file, { upsert: true, contentType: file.type })

  if (error) throw error
  return safePath
}

export async function removeAnnouncementImage(path: string): Promise<void> {
  const { error } = await client().storage.from(ANNOUNCEMENT_BUCKET).remove([path])
  if (error) throw error
}

export async function removeAnnouncementImages(
  paths: Array<string | null | undefined>,
): Promise<void> {
  const existing = paths.filter((path): path is string => Boolean(path))
  if (!existing.length) return
  const { error } = await client().storage.from(ANNOUNCEMENT_BUCKET).remove(existing)
  if (error) throw error
}
