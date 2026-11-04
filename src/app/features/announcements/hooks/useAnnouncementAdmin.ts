import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as service from '../services/announcementService'
import type { Announcement } from '../models/announcement'
import type { AnnouncementForm } from '../models/announcementFormSchema'
import { ANNOUNCEMENT_PAGE_SIZE, announcementQueryKeys } from '../models/announcementCatalog'
import { processAnnouncementImage } from '../shared/processAnnouncementImage'
export function useAnnouncementAdmin(page: number, search: string, onError: (e: unknown) => void) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: announcementQueryKeys.list(page, search),
    queryFn: () => service.listAnnouncements(page, ANNOUNCEMENT_PAGE_SIZE, search),
  })
  const invalidate = () => qc.invalidateQueries({ queryKey: announcementQueryKeys.all })
  const save = useMutation({
    mutationFn: async ({
      announcement,
      values,
    }: {
      announcement: Announcement | null
      values: AnnouncementForm
    }) => {
      const { image, ...announcementValues } = values
      const selectedFile = image ?? null
      const old = announcement?.imagePath ?? null
      const oldVariants = announcement
        ? [
            announcement.imageDesktopPath,
            announcement.imageTabletPath,
            announcement.imageMobilePath,
          ]
        : []
      let imagePath = old
      let imageDesktopPath = announcement?.imageDesktopPath ?? null
      let imageTabletPath = announcement?.imageTabletPath ?? null
      let imageMobilePath = announcement?.imageMobilePath ?? null
      if (selectedFile) {
        const variants = await processAnnouncementImage(selectedFile)
        const id = announcement?.id ?? crypto.randomUUID()
        const version = crypto.randomUUID()
        imageDesktopPath = await service.uploadAnnouncementImage(
          variants.desktop,
          `${id}/${version}/desktop.webp`,
        )
        imageTabletPath = await service.uploadAnnouncementImage(
          variants.tablet,
          `${id}/${version}/tablet.webp`,
        )
        imageMobilePath = await service.uploadAnnouncementImage(
          variants.mobile,
          `${id}/${version}/mobile.webp`,
        )
        imagePath = imageDesktopPath
      }
      const result = announcement
        ? await service.updateAnnouncement(announcement.id, {
            ...announcementValues,
            imagePath,
            imageDesktopPath,
            imageTabletPath,
            imageMobilePath,
            active: announcement.active,
            position: announcement.position,
          })
        : await service.createAnnouncement({
            ...announcementValues,
            imagePath,
            imageDesktopPath,
            imageTabletPath,
            imageMobilePath,
            active: true,
            position: query.data?.total ?? 0,
          })
      if (announcement && selectedFile)
        await service.removeAnnouncementImages([old, ...oldVariants])
      return result
    },
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: async (i: Announcement) => {
      await service.deleteAnnouncement(i.id)
      await service.removeAnnouncementImages([
        i.imagePath,
        i.imageDesktopPath,
        i.imageTabletPath,
        i.imageMobilePath,
      ])
    },
    onSuccess: invalidate,
    onError,
  })
  const toggle = useMutation({
    mutationFn: (i: Announcement) => service.updateAnnouncementStatus(i.id, !i.active),
    onSuccess: invalidate,
    onError,
  })
  const move = useMutation({
    mutationFn: (items: Announcement[]) =>
      service.reorderAnnouncements(
        items.map((i, n) => ({ id: i.id, position: (page - 1) * ANNOUNCEMENT_PAGE_SIZE + n })),
      ),
    onSuccess: invalidate,
    onError,
  })
  return {
    query,
    save,
    remove,
    toggle,
    move,
    isMutating: save.isPending || remove.isPending || toggle.isPending || move.isPending,
  }
}
