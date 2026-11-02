import { supabase } from '@/app/shared/lib/supabase'
import type { ReadingGuideRemoteRow } from '../models/readingGuide'

const BUCKET = 'resource-assets'
const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/
const MONTH_DATE_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])-01$/

export const toPersistedMonthDate = (month: string) => {
  if (!MONTH_PATTERN.test(month)) throw new Error('El período debe tener el formato YYYY-MM.')
  return `${month}-01`
}

export const toDomainMonth = (monthDate: string) => {
  const match = MONTH_DATE_PATTERN.exec(monthDate)
  if (!match) throw new Error('El período almacenado debe tener el formato YYYY-MM-01.')
  return `${match[1]}-${match[2]}`
}

const toDomainRow = (row: ReadingGuideRemoteRow): ReadingGuideRemoteRow => ({
  ...row,
  month_date: toDomainMonth(row.month_date),
})

const client = () => {
  if (!supabase) throw new Error('Supabase no está configurado.')
  return supabase
}
const userId = async () => {
  const user = (await client().auth.getUser()).data.user
  if (!user) throw new Error('Debes iniciar sesión.')
  return user.id
}
export const listReadingGuideRows = async () => {
  const { data, error } = await client().from('reading_guides').select('*').order('month_date')
  if (error) throw error
  return ((data ?? []) as ReadingGuideRemoteRow[]).map(toDomainRow)
}
export const getReadingGuideRow = async (id: string) => {
  const { data, error } = await client().from('reading_guides').select('*').eq('id', id).single()
  if (error) throw error
  return toDomainRow(data as ReadingGuideRemoteRow)
}
export const createReadingGuideRow = async (monthDate: string, imagePath: string) => {
  const persistedMonthDate = toPersistedMonthDate(monthDate)
  const { data, error } = await client().from('reading_guides').insert({ month_date: persistedMonthDate, image_path: imagePath, created_by: await userId() }).select('*').single()
  if (error) throw error
  return toDomainRow(data as ReadingGuideRemoteRow)
}
export const updateReadingGuideRow = async (id: string, monthDate: string, imagePath?: string) => {
  const persistedMonthDate = toPersistedMonthDate(monthDate)
  const { data, error } = await client().from('reading_guides').update({ month_date: persistedMonthDate, ...(imagePath ? { image_path: imagePath } : {}) }).eq('id', id).select('*').single()
  if (error) throw error
  return toDomainRow(data as ReadingGuideRemoteRow)
}
export const deleteReadingGuideRow = async (id: string) => {
  const { error } = await client().from('reading_guides').delete().eq('id', id)
  if (error) throw error
}
export const uploadResourceAsset = async (file: File) => {
  const path = `${await userId()}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const { error } = await client().storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error
  return path
}
export const removeResourceAsset = async (path: string) => {
  const { error } = await client().storage.from(BUCKET).remove([path])
  if (error) throw error
}
export const getResourceAssetUrl = (path: string) => client().storage.from(BUCKET).getPublicUrl(path).data.publicUrl
