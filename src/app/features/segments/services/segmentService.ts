import {
  createSegmentRow,
  deleteSegmentRow,
  getPublicSegmentRow,
  getSegmentRow,
  listPublicSegmentRows,
  listSegmentRows,
  reorderSegmentRows,
  setSegmentStatus,
  updateSegmentRow,
} from '../requests/segmentRequests'
import type { Paginated, SegmentInput, SegmentStatus } from '../models/segment'

type SegmentListItem = {
  id: string
  title: string
  month: number
  year: number
  position: number
  status: SegmentStatus
  days: number
  createdAt: string
  updatedAt: string
}

export async function listSegments(
  page = 1,
  pageSize = 10,
  search = '',
): Promise<Paginated<SegmentListItem>> {
  const result = await listSegmentRows(page, pageSize, search)
  return {
    items: result.data.map(mapRow),
    page,
    pageSize,
    total: result.count,
    totalPages: Math.max(1, Math.ceil(result.count / pageSize)),
  }
}
function mapRow(row: {
  id: string
  title: string
  month: number
  year: number
  position: number
  status: SegmentStatus
  created_at: string
  updated_at: string
  segment_days?: { count: number }[]
}): SegmentListItem {
  return {
    id: row.id,
    title: row.title,
    month: row.month,
    year: row.year,
    position: row.position,
    status: row.status,
    days: row.segment_days?.[0]?.count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
export const createSegment = (input: SegmentInput) => createSegmentRow(input)
export const deleteSegment = (id: string) => deleteSegmentRow(id)
export const updateSegmentStatus = (id: string, status: SegmentStatus) =>
  setSegmentStatus(id, status)
export const getSegment = (id: string) => getSegmentRow(id)
export const updateSegment = (id: string, input: SegmentInput) => updateSegmentRow(id, input)
export const reorderSegments = reorderSegmentRows

export async function listPublicSegments() {
  const rows = await listPublicSegmentRows()
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    month: row.month,
    year: row.year,
    position: row.position,
    coverPath: row.cover_path,
    days: row.segment_days?.[0]?.count ?? 0,
  }))
}

export async function getPublicSegment(id: string) {
  const row = await getPublicSegmentRow(id)
  return {
    id: row.id,
    title: row.title,
    month: row.month,
    year: row.year,
    coverPath: row.cover_path,
    days: row.segment_days.map((day) => ({
      id: day.id,
      day: day.day,
      blocks: [...day.segment_blocks].sort((a, b) => a.position - b.position),
    })),
  }
}
