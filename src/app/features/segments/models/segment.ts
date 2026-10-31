export type SegmentStatus = 'draft' | 'active'
export type SegmentBlockType = 'text' | 'image' | 'video'

export type SegmentBlockInput = { type: SegmentBlockType; content: string; fileName?: string }
export type SegmentDayInput = { day: number; blocks: SegmentBlockInput[] }
export type SegmentInput = {
  title: string
  month: number
  year: number
  status?: SegmentStatus
  coverPath?: string
  days: SegmentDayInput[]
}
export type Segment = SegmentInput & { id: string; createdAt: string; updatedAt: string }
export type Paginated<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
