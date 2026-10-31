import * as requests from '../requests/announcementRequests'
import type {
  Announcement,
  AnnouncementInput,
  AnnouncementListItem,
  AnnouncementRemoteRow,
  Paginated,
} from '../models/announcement'

function mapAnnouncement(row: AnnouncementRemoteRow): Announcement {
  return {
    id: row.id,
    imagePath: row.image_path,
    imageDesktopPath: row.image_desktop_path,
    imageTabletPath: row.image_tablet_path,
    imageMobilePath: row.image_mobile_path,
    href: row.href,
    active: row.active,
    position: row.position,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listAnnouncements(
  page = 1,
  pageSize = 10,
  search = '',
): Promise<Paginated<AnnouncementListItem>> {
  const result = await requests.listAnnouncementRows(page, pageSize, search)
  return {
    items: result.data.map(mapAnnouncement),
    page,
    pageSize,
    total: result.count,
    totalPages: Math.max(1, Math.ceil(result.count / pageSize)),
  }
}

export async function listPublicAnnouncements(): Promise<Announcement[]> {
  return (await requests.listPublicAnnouncementRows()).map(mapAnnouncement)
}

export async function getAnnouncement(id: string): Promise<Announcement> {
  return mapAnnouncement(await requests.getAnnouncementRow(id))
}

export async function createAnnouncement(input: AnnouncementInput): Promise<Announcement> {
  return mapAnnouncement(await requests.createAnnouncementRow(input))
}

export async function updateAnnouncement(
  id: string,
  input: AnnouncementInput,
): Promise<Announcement> {
  return mapAnnouncement(await requests.updateAnnouncementRow(id, input))
}

export const deleteAnnouncement = requests.deleteAnnouncementRow
export const updateAnnouncementStatus = requests.setAnnouncementActive
export const reorderAnnouncements = requests.reorderAnnouncements
export const uploadAnnouncementImage = requests.uploadAnnouncementImage
export const removeAnnouncementImage = requests.removeAnnouncementImage
export const removeAnnouncementImages = requests.removeAnnouncementImages
export const resolveAnnouncementImageUrl = requests.getAnnouncementImageUrl
