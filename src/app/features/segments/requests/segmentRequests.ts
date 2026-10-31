import { supabase } from '@/app/shared/lib/supabase'
import type { SegmentInput, SegmentStatus } from '../models/segment'

function client() {
  if (!supabase) throw new Error('Supabase no está configurado.')
  return supabase
}

export async function listSegmentRows(page: number, pageSize: number, search: string) {
  const from = (page - 1) * pageSize
  let query = client()
    .from('segments')
    .select('id,title,month,year,position,status,created_at,updated_at,segment_days(count)', {
      count: 'exact',
    })
    .order('position', { ascending: true })
    .order('id', { ascending: true })
    .range(from, from + pageSize - 1)
  if (search.trim()) query = query.ilike('title', `%${search.trim()}%`)
  const { data, error, count } = await query
  if (error) throw error
  return { data: data ?? [], count: count ?? 0 }
}

export async function createSegmentRow(input: SegmentInput) {
  const user = (await client().auth.getUser()).data.user
  if (!user) throw new Error('Debes iniciar sesión para crear segmentos.')
  const { data: segment, error } = await client()
    .from('segments')
    .insert({
      title: input.title.trim(),
      month: input.month,
      year: input.year,
      status: input.status ?? 'draft',
      cover_path: input.coverPath ?? null,
      created_by: user.id,
    })
    .select('id')
    .single()
  if (error) throw error
  for (const day of input.days) {
    const { data: dayRow, error: dayError } = await client()
      .from('segment_days')
      .insert({ segment_id: segment.id, day: day.day })
      .select('id')
      .single()
    if (dayError) throw dayError
    if (day.blocks.length) {
      const { error: blockError } = await client()
        .from('segment_blocks')
        .insert(
          day.blocks.map((block, position) => ({
            day_id: dayRow.id,
            type: block.type,
            content: block.content,
            file_name: block.fileName ?? null,
            position,
          })),
        )
      if (blockError) throw blockError
    }
  }
  return segment.id
}

export async function deleteSegmentRow(id: string) {
  const { error } = await client().from('segments').delete().eq('id', id)
  if (error) throw error
}
export async function setSegmentStatus(id: string, status: SegmentStatus) {
  const { error } = await client().from('segments').update({ status }).eq('id', id)
  if (error) throw error
}
export async function getSegmentRow(id: string) {
  const { data, error } = await client()
    .from('segments')
    .select(
      'id,title,month,year,position,status,cover_path,segment_days(day,segment_blocks(type,content,file_name,position))',
    )
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}
export async function updateSegmentRow(id: string, input: SegmentInput) {
  const { error } = await client()
    .from('segments')
    .update({
      title: input.title.trim(),
      month: input.month,
      year: input.year,
      cover_path: input.coverPath ?? null,
      status: input.status ?? 'draft',
    })
    .eq('id', id)
  if (error) throw error
  const { error: daysError } = await client().from('segment_days').delete().eq('segment_id', id)
  if (daysError) throw daysError
  for (const day of input.days) {
    const { data: dayRow, error: dayError } = await client()
      .from('segment_days')
      .insert({ segment_id: id, day: day.day })
      .select('id')
      .single()
    if (dayError) throw dayError
    if (day.blocks.length) {
      const { error: blockError } = await client()
        .from('segment_blocks')
        .insert(
          day.blocks.map((block, position) => ({
            day_id: dayRow.id,
            type: block.type,
            content: block.content,
            file_name: block.fileName ?? null,
            position,
          })),
        )
      if (blockError) throw blockError
    }
  }
}

export async function listPublicSegmentRows() {
  const { data, error } = await client()
    .from('segments')
    .select('id,title,month,year,position,cover_path,segment_days(count)')
    .eq('status', 'active')
    .order('position', { ascending: true })
    .order('id', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function getPublicSegmentRow(id: string) {
  const { data, error } = await client()
    .from('segments')
    .select(
      'id,title,month,year,position,cover_path,segment_days(id,day,segment_blocks(id,type,content,file_name,position))',
    )
    .eq('id', id)
    .eq('status', 'active')
    .single()
  if (error) throw error
  return data
}

export async function reorderSegmentRows(
  firstId: string,
  firstPosition: number,
  secondId: string,
  secondPosition: number,
) {
  const { error } = await client().rpc('reorder_segments', {
    first_id: firstId,
    first_position: firstPosition,
    second_id: secondId,
    second_position: secondPosition,
  })
  if (error) throw error
}
