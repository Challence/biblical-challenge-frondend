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
