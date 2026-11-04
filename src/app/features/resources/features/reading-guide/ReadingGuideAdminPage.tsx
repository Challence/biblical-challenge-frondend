import { IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { useEffect, useMemo, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AdminPageHeader } from '@/app/shared/components/navigation/AdminPageHeader'
import { Button } from '@/app/shared/components/ui/button'
import { ShareButton } from '@/app/shared/components/share/ShareButton'
import { EmptyState } from '@/app/shared/components/empty-state/EmptyState'
import { Card, CardContent } from '@/app/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'
import { RhfFileField } from '@/app/shared/components/fields/rhf/RhfFileField'
import { RhfSelectField } from '@/app/shared/components/fields/rhf/RhfSelectField'
import { RhfYearField } from '@/app/shared/components/fields/rhf/RhfYearField'
import { useModalAlert } from '@/app/shared/hooks/useModalAlert'
import { useReadingGuides } from './hooks/useReadingGuides'
import { ReadingGuideFilters, type ReadingGuideFilterValues } from './ReadingGuideFilters'
import type { ReadingGuide } from './models/readingGuide'
import {
  readingGuideFormSchema,
  type ReadingGuideFormValues,
} from './models/readingGuideFormSchema'
import { getReadingGuideErrorMessage } from './models/readingGuideError'

const monthName = (date: string) =>
  new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(
    new Date(`${date}-01T00:00:00`),
  )
const months = Array.from({ length: 12 }, (_, index) => ({
  value: String(index + 1).padStart(2, '0'),
  label: new Intl.DateTimeFormat('es', { month: 'long' }).format(new Date(2000, index, 1)),
}))

export function ReadingGuideAdminPage() {
  const guides = useReadingGuides()
  const { warning, error } = useModalAlert()
  const [editing, setEditing] = useState<ReadingGuide | undefined>()
  const [filters, setFilters] = useState<ReadingGuideFilterValues>({ month: '', year: '' })
  const [open, setOpen] = useState(false)
  const form = useForm<ReadingGuideFormValues>({
    resolver: zodResolver(readingGuideFormSchema),
    defaultValues: { year: '', month: '', imageFile: null },
  })
  const existing = useMemo(() => guides.data ?? [], [guides.data])
  const currentYear = new Date().getFullYear()
  const filteredGuides = useMemo(
    () =>
      existing.filter((guide) => {
        const [guideYear, guideMonth] = guide.monthDate.split('-')
        return (
          (!filters.year || guideYear === filters.year) &&
          (!filters.month || guideMonth === filters.month)
        )
      }),
    [existing, filters],
  )
  const year = useWatch({ control: form.control, name: 'year' })
  const monthOptions = months.map((option) => ({
    ...option,
    disabled: Boolean(
      year &&
      existing.some(
        (guide) => guide.monthDate === `${year}-${option.value}` && guide.id !== editing?.id,
      ),
    ),
  }))
  const file = useWatch({ control: form.control, name: 'imageFile' })
  const preview = useMemo(
    () => (file instanceof File ? URL.createObjectURL(file) : editing?.imageUrl),
    [file, editing],
  )

  useEffect(
    () => () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview)
    },
    [preview],
  )
  const openEditor = (guide?: ReadingGuide) => {
    form.clearErrors('root')
    setEditing(guide)
    const [guideYear = '', guideMonth = ''] = guide?.monthDate.split('-') ?? []
    form.reset({ year: guideYear, month: guideMonth, imageFile: null })
    setOpen(true)
  }
  const closeEditor = () => {
    form.clearErrors('root')
    setOpen(false)
    setEditing(undefined)
    form.reset({ year: '', month: '', imageFile: null })
  }
  const submit = form.handleSubmit(
    async (values) => {
      form.clearErrors('root')
      if (!editing && !values.imageFile) {
        form.setError('imageFile', { message: 'Selecciona una imagen.' })
        return
      }
      try {
        if (editing)
          await guides.update.mutateAsync({
            id: editing.id,
            input: {
              monthDate: `${values.year}-${values.month}`,
              imageFile: values.imageFile ?? undefined,
            },
          })
        else
          await guides.create.mutateAsync({
            monthDate: `${values.year}-${values.month}`,
            imageFile: values.imageFile ?? undefined,
          })
        closeEditor()
      } catch (saveError) {
        form.setError('root', { message: getReadingGuideErrorMessage(saveError, 'save') })
      }
    },
    () => form.clearErrors('root'),
  )
  const remove = async (guide: ReadingGuide) => {
    if (
      (
        await warning({
          title: 'Eliminar guía',
          message: `¿Seguro que quieres eliminar la guía de ${monthName(guide.monthDate)}?`,
          confirmLabel: 'Eliminar',
        })
      ).action !== 'confirm'
    )
      return
    try {
      await guides.remove.mutateAsync(guide.id)
    } catch (deleteError) {
      void error({
        title: 'No se pudo eliminar la guía',
        message: getReadingGuideErrorMessage(deleteError, 'delete'),
      })
    }
  }
  const pending = guides.create.isPending || guides.update.isPending
  return (
    <main className="mx-auto max-w-[76rem]">
      <AdminPageHeader
        title="Guía de lectura"
        description="Gestiona la imagen de apoyo de cada período."
        action={
          <Button type="button" onClick={() => openEditor()}>
            <IconPlus size={18} aria-hidden="true" />
            Agregar guía
          </Button>
        }
      />
      {guides.isLoading && <p role="status">Cargando guías…</p>}
      {guides.isError && (
        <div role="alert" className="grid justify-items-start gap-2 text-destructive">
          <p>{getReadingGuideErrorMessage(guides.error, 'load')}</p>
          <Button type="button" variant="outline" onClick={() => void guides.refetch()}>
            Reintentar
          </Button>
        </div>
      )}
      {!guides.isLoading && !guides.isError && !existing.length && (
        <EmptyState title="Aún no hay guías" description="Agrega una guía para comenzar." />
      )}
      {!guides.isLoading && !guides.isError && !!existing.length && (
        <>
          <ReadingGuideFilters guides={existing} value={filters} onChange={setFilters} />
          {!filteredGuides.length && (
            <EmptyState
              title="No hay guías para los filtros seleccionados"
              description="Prueba con otros filtros para encontrar una guía."
            />
          )}
          {!!filteredGuides.length && (
            <section
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              aria-label="Guías de lectura"
            >
              {filteredGuides.map((guide) => (
                <Card key={guide.id}>
                  <CardContent className="p-4">
                    <img
                      src={guide.imageUrl}
                      alt={`Guía de lectura de ${monthName(guide.monthDate)}`}
                      className="aspect-[4/3] w-full rounded-md object-cover"
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <h2 className="text-base font-semibold">{monthName(guide.monthDate)}</h2>
                      <div className="flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar guía de ${monthName(guide.monthDate)}`}
                          onClick={() => openEditor(guide)}
                        >
                          <IconEdit size={18} aria-hidden="true" />
                        </Button>
                        <ShareButton
                          content={{
                            kind: 'readingGuide',
                            data: {
                              name: `Guía de lectura de ${monthName(guide.monthDate)}`,
                              description: `Consulta la guía de lectura de ${monthName(guide.monthDate)}.`,
                            },
                            publicUrl: `${window.location.origin}/guia/${guide.id}`,
                            files: [guide.imageUrl],
                            entityId: guide.id,
                          }}
                          variant="admin"
                          accessibleLabel={`Compartir ${monthName(guide.monthDate)}`}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Eliminar guía de ${monthName(guide.monthDate)}`}
                          onClick={() => void remove(guide)}
                        >
                          <IconTrash size={18} aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>
          )}
        </>
      )}
      <Dialog open={open} onOpenChange={(value) => !value && closeEditor()}>
        <DialogContent aria-labelledby="guide-dialog-title">
          <DialogHeader>
            <DialogTitle id="guide-dialog-title">
              {editing ? 'Editar guía' : 'Agregar guía'}
            </DialogTitle>
            <DialogDescription>Selecciona un período y una imagen para la guía.</DialogDescription>
          </DialogHeader>
          <FormProvider {...form}>
            <form onSubmit={submit} className="grid gap-4">
              <RhfYearField
                name="year"
                id="guide-year"
                label="Año"
                required
                min={currentYear - 3}
                max={currentYear + 3}
                placeholder="Selecciona un año"
              />
              <RhfSelectField
                name="month"
                id="guide-month"
                label="Mes"
                required
                options={monthOptions}
                placeholder="Selecciona un mes"
              />
              <RhfFileField
                name="imageFile"
                id="guide-image"
                label="Imagen"
                accept="image/*"
                required={!editing}
              />
              {preview && (
                <img
                  src={preview}
                  alt="Vista previa de la guía"
                  className="max-h-48 w-full rounded-md object-contain"
                />
              )}
              {editing && !file && (
                <p className="text-sm text-muted-foreground">Se conservará la imagen actual.</p>
              )}
              {form.formState.errors.root && (
                <p
                  role="alert"
                  className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {form.formState.errors.root.message}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeEditor}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending || form.formState.isSubmitting}>
                  {pending ? 'Guardando…' : 'Guardar guía'}
                </Button>
              </div>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </main>
  )
}
