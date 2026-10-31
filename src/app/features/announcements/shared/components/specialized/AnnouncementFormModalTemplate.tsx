import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { IconX } from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'
import { RhfTextField } from '@/app/shared/components/fields/rhf/RhfTextField'
import { RhfTextareaField } from '@/app/shared/components/fields/rhf/RhfTextareaField'
import { RhfFileField } from '@/app/shared/components/fields/rhf/RhfFileField'
import type { ModalTemplateProps } from '@/app/shared/models/modal'
import type { Announcement } from '../../../models/announcement'
import {
  announcementCreateFormSchema,
  announcementFormDefaults,
  announcementFormSchema,
  type AnnouncementForm,
} from '../../../models/announcementFormSchema'

export type AnnouncementFormModalData = {
  announcement: Announcement | null
  save: (announcement: Announcement | null, values: AnnouncementForm) => Promise<unknown>
}

export function AnnouncementFormModalTemplate({
  data,
  confirm,
  close,
}: ModalTemplateProps<AnnouncementFormModalData, unknown>) {
  const form = useForm<AnnouncementForm>({
    resolver: zodResolver(
      data.announcement ? announcementFormSchema : announcementCreateFormSchema,
    ),
    defaultValues: data.announcement
      ? {
          title: data.announcement.title,
          description: data.announcement.description,
          href: data.announcement.href ?? '',
          image: null,
        }
      : announcementFormDefaults,
  })
  const submit = form.handleSubmit(async (values) => {
    try {
      await data.save(data.announcement, values)
      confirm()
    } catch (cause) {
      form.setError('root', {
        message: cause instanceof Error ? cause.message : 'Intenta de nuevo.',
      })
    }
  })
  return (
    <FormProvider {...form}>
      <form className="grid gap-4" onSubmit={submit}>
        <RhfTextField name="title" id="announcement-title" label="Título" required />
        <RhfTextareaField
          name="description"
          id="announcement-description"
          label="Descripción"
          required
        />
        <RhfTextField
          name="href"
          id="announcement-href"
          label="Enlace"
          placeholder="/lectura-hoy"
          required
        />
        <RhfFileField
          name="image"
          id="announcement-image"
          label="Imagen"
          accept="image/*"
          required={!data.announcement}
        />
        {form.formState.errors.root && <p role="alert">{form.formState.errors.root.message}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={close}>
            <IconX aria-hidden="true" /> Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Guardando…' : 'Guardar anuncio'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
