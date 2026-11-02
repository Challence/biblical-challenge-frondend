import { useEffect, useMemo } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/app/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'
import { RhfFileField } from '@/app/shared/components/fields/rhf/RhfFileField'
import { RhfSelectField } from '@/app/shared/components/fields/rhf/RhfSelectField'
import { RhfTextareaField } from '@/app/shared/components/fields/rhf/RhfTextareaField'
import { RhfTextField } from '@/app/shared/components/fields/rhf/RhfTextField'
import type { MonthlyResource, ResourceInput } from '../../../models/resource'
import {
  resourceEditFormSchema,
  resourceFormSchema,
  type ResourceFormValues,
} from '../../../models/resourceFormSchema'

export function ResourceFormDialog({
  open,
  resource,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  resource?: MonthlyResource
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ResourceInput) => void
}) {
  const formSchema = resource ? resourceEditFormSchema : resourceFormSchema
  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues:
      resource?.type === 'video'
        ? {
            type: 'video',
            title: resource.title,
            description: resource.description,
            videoUrl: resource.videoUrl ?? '',
          }
        : {
            type: 'image',
            title: resource?.title ?? '',
            description: resource?.description ?? '',
            imageFile: null,
          },
  })
  const type = useWatch({ control: form.control, name: 'type' })
  const file = useWatch({ control: form.control, name: 'imageFile' })
  const preview = useMemo(
    () =>
      file instanceof File
        ? URL.createObjectURL(file)
        : resource?.type === 'image'
          ? resource.imageUrl
          : undefined,
    [file, resource],
  )
  useEffect(() => {
    if (open)
      form.reset(
        resource?.type === 'video'
          ? {
              type: 'video',
              title: resource.title,
              description: resource.description,
              videoUrl: resource.videoUrl ?? '',
            }
          : {
              type: 'image',
              title: resource?.title ?? '',
              description: resource?.description ?? '',
              imageFile: null,
            },
      )
  }, [open, resource, form])
  useEffect(
    () => () => {
      if (file instanceof File && preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    },
    [file, preview],
  )
  const submit = (values: ResourceFormValues) =>
    onSubmit(
      values.type === 'image'
        ? {
            type: 'image',
            title: values.title,
            description: values.description,
            imagePath: resource?.imagePath,
            imageFile: values.imageFile ?? undefined,
          }
        : {
            type: 'video',
            title: values.title,
            description: values.description,
            videoUrl: values.videoUrl,
          },
    )
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-labelledby="resource-dialog-title">
        <DialogHeader>
          <DialogTitle id="resource-dialog-title">
            {resource ? 'Editar recurso' : 'Nuevo recurso'}
          </DialogTitle>
          <DialogDescription>Administra la imagen o el vídeo de este mes.</DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(submit)}>
            <RhfTextField name="title" id="resource-title" label="Título" />
            <RhfTextareaField
              name="description"
              id="resource-description"
              label="Descripción"
              rows={3}
            />
            <RhfSelectField
              name="type"
              id="resource-type"
              label="Tipo"
              options={[
                { value: 'image', label: 'Imagen' },
                { value: 'video', label: 'Vídeo' },
              ]}
            />
            <div className={type === 'image' ? '' : 'hidden'}>
              <RhfFileField
                name="imageFile"
                id="resource-image"
                label="Imagen"
                accept="image/*"
                required={!resource}
              />
              {preview && (
                <img
                  src={preview}
                  alt="Vista previa del recurso"
                  className="mt-2 max-h-40 rounded object-contain"
                />
              )}
            </div>
            {type === 'video' && (
              <RhfTextareaField
                name="videoUrl"
                id="resource-video-url"
                label="URL HTTPS del vídeo"
                placeholder="https://…"
                rows={2}
              />
            )}
            {form.formState.errors.root && <p role="alert">{form.formState.errors.root.message}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending || form.formState.isSubmitting}>
                {pending ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
