export type ResourceType = 'image' | 'video'

export type ResourceMonthInput = { monthDate: string; position?: number }
export type ResourceInput =
  | {
      type: 'image'
      title?: string
      description?: string
      imagePath?: string | null
      imageFile?: File
      position?: number
    }
  | { type: 'video'; title?: string; description?: string; videoUrl: string; position?: number }

export type ResourceMonth = {
  id: string
  monthDate: string
  position: number
  createdBy: string
  createdAt: string
  updatedAt: string
}
export type MonthlyResource = {
  id: string
  resourceMonthId: string
  type: ResourceType
  title: string
  description: string
  imagePath: string | null
  imageUrl?: string
  videoUrl: string | null
  position: number
  createdBy: string
  createdAt: string
  updatedAt: string
}
export type Paginated<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type ResourceMonthRemoteRow = {
  id: string
  month_date: string
  position: number
  created_by: string
  created_at: string
  updated_at: string
}
export type MonthlyResourceRemoteRow = {
  id: string
  resource_month_id: string
  type: ResourceType
  title: string
  description: string
  image_path: string | null
  video_url: string | null
  position: number
  created_by: string
  created_at: string
  updated_at: string
}

export type ReadingGuideInput = { monthDate: string; imageFile?: File; imagePath?: string }
export type ReadingGuide = {
  id: string
  monthDate: string
  imagePath: string
  imageUrl: string
  createdBy: string
  createdAt: string
  updatedAt: string
}
export type ReadingGuideRemoteRow = {
  id: string
  month_date: string
  image_path: string
  created_by: string
  created_at: string
  updated_at: string
}
