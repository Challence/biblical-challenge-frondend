import { useModal } from '@/app/shared/hooks/useModal'
import type { Announcement } from '../models/announcement'
import {
  AnnouncementFormModalTemplate,
  type AnnouncementFormModalData,
} from '../shared/components/specialized/AnnouncementFormModalTemplate'

export function useAnnouncementModal(save: AnnouncementFormModalData['save']) {
  const { open } = useModal()
  return (announcement: Announcement | null = null) =>
    open<AnnouncementFormModalData, unknown>({
      data: { announcement, save },
      title: announcement ? 'Editar anuncio' : 'Nuevo anuncio',
      description: 'Completa los campos requeridos.',
      template: AnnouncementFormModalTemplate,
    })
}
