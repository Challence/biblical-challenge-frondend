export type AnnouncementInput = {
  title: string
  description: string
  imagePath?: string | null
  imageDesktopPath?: string | null
  imageTabletPath?: string | null
  imageMobilePath?: string | null
  href?: string | null
  active?: boolean
  position?: number
}

export type Announcement = AnnouncementInput & {
  id: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type AnnouncementListItem = Announcement
export type Paginated<T> = {
  items: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type AnnouncementRemoteRow = {
  id: string
  title: string
  description: string
  image_path: string | null
  image_desktop_path: string | null
  image_tablet_path: string | null
  image_mobile_path: string | null
  href: string | null
  active: boolean
  position: number
  created_by: string
  created_at: string
  updated_at: string
}
