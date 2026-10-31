export const ANNOUNCEMENT_PAGE_SIZE = 8
export const ANNOUNCEMENT_BUCKET = 'announcement-assets'

export const announcementQueryKeys = {
  all: ['announcements'] as const,
  list: (page: number, search: string) => ['announcements', page, search] as const,
}
