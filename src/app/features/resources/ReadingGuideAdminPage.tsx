import { IconBook2, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AdminBreadcrumb } from '@/app/shared/components/navigation/AdminBreadcrumb'
import { Button } from '@/app/shared/components/ui/button'
import { Card, CardContent } from '@/app/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'
import { FileField } from '@/app/shared/components/fields/base/FileField'
import { SelectField } from '@/app/shared/components/fields/base/SelectField'
import { makeId } from './resources'
import { READING_GUIDE_MONTHS } from './models/resourceCatalog'
import { useModalAlert } from '@/app/shared/hooks/useModalAlert'

type ReadingGuide = { id: string; month: string; image: string }

export function ReadingGuideAdminPage() {
  const [guides, setGuides] = useState<ReadingGuide[]>([])
  const [editing, setEditing] = useState<ReadingGuide | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [month, setMonth] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState('')

  const [filePreview, setFilePreview] = useState<string | null>(null)
  const { warning } = useModalAlert()
  const objectUrls = useRef(new Set<string>())
  useEffect(
    () => () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    },
    [],
  )
  const openNew = () => {
    setEditing(null)
    setMonth('')
    setFile(null)
    setFilePreview(null)
    setImageError('')
    setEditorOpen(true)
  }
  const openEdit = (guide: ReadingGuide) => {
    setEditing(guide)
    setMonth(guide.month)
    setFile(null)
    setFilePreview(null)
    setImageError('')
    setEditorOpen(true)
  }
  const closeEditor = () => {
    setEditing(null)
    setFile(null)
    setFilePreview(null)
    setImageError('')
    setEditorOpen(false)
  }
  const available = READING_GUIDE_MONTHS.filter(
    (item) => !guides.some((guide) => guide.month === item.id) || item.id === editing?.month,
  )
  const save = (event: FormEvent) => {
    event.preventDefault()
    if (!month || (!file && !editing)) {
      if (!file && !editing) setImageError('Selecciona una imagen.')
      return
    }
    const image = file ? URL.createObjectURL(file) : editing!.image
    if (file) objectUrls.current.add(image)
    if (editing)
      setGuides((items) =>
        items.map((item) => (item.id === editing.id ? { ...item, month, image } : item)),
      )
    else setGuides((items) => [...items, { id: makeId(), month, image }])
    closeEditor()
  }
  const remove = (guide: ReadingGuide) => {
    if (guide.image.startsWith('blob:')) {
      URL.revokeObjectURL(guide.image)
      objectUrls.current.delete(guide.image)
    }
    setGuides((items) => items.filter((item) => item.id !== guide.id))
  }
  const requestRemove = async (guide: ReadingGuide) => {
    const result = await warning({
      title: 'Eliminar guía',
      message: `¿Seguro que quieres eliminar la guía de ${monthName(guide.month)}?`,
      confirmLabel: 'Eliminar',
    })
    if (result.action === 'confirm') remove(guide)
  }
  const monthName = (id: string) => READING_GUIDE_MONTHS.find((item) => item.id === id)?.title ?? id

  return (
    <main className="mx-auto max-w-[76rem]">
      <AdminBreadcrumb
        items={[{ label: 'Recursos', to: '/admin/recursos' }]}
        currentLabel="Guía de lectura"
        backTo="/admin/recursos"
      />
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="m-0 font-[Merriweather,Georgia,serif] text-[clamp(2rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.04em]">
            Guía de lectura
          </h1>
          <p className="mt-2 mb-0 text-muted-foreground">
            Gestiona la imagen de apoyo de cada mes.
          </p>
        </div>
        <Button type="button" onClick={openNew} disabled={!available.length}>
          <IconPlus size={18} aria-hidden="true" />
          Agregar guía
        </Button>
      </header>
      {guides.length === 0 ? (
        <section
          className="rounded-lg border border-dashed p-8 text-center"
          aria-labelledby="reading-guide-empty-title"
        >
          <IconBook2 className="mx-auto text-primary" size={40} aria-hidden="true" />
          <h2
            id="reading-guide-empty-title"
            className="mt-4 font-[Merriweather,Georgia,serif] text-xl font-bold"
          >
            Aún no hay guías
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Agrega una guía para comenzar a acompañar la lectura.
          </p>
        </section>
      ) : (
        <section
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          aria-label="Guías de lectura"
        >
          {guides.map((guide) => (
            <Card key={guide.id}>
              <CardContent className="p-4">
                <img
                  src={guide.image}
                  alt={`Guía de lectura de ${monthName(guide.month)}`}
                  className="aspect-[4/3] w-full rounded-md object-cover"
                />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <h2 className="m-0 text-base font-semibold">{monthName(guide.month)}</h2>
                  <div className="flex">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Editar guía de ${monthName(guide.month)}`}
                      title="Editar"
                      onClick={() => openEdit(guide)}
                    >
                      <IconEdit size={18} aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Eliminar guía de ${monthName(guide.month)}`}
                      title="Eliminar"
                      onClick={() => void requestRemove(guide)}
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
      {!available.length && guides.length > 0 && (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          Todos los meses ya tienen una guía.
        </p>
      )}

      <Dialog open={editorOpen} onOpenChange={(open) => !open && closeEditor()}>
        <DialogContent aria-labelledby="guide-dialog-title">
          <DialogHeader>
            <DialogTitle id="guide-dialog-title">
              {editing ? 'Editar guía' : 'Agregar guía'}
            </DialogTitle>
            <DialogDescription>Selecciona un mes y una imagen para la guía.</DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="grid gap-4">
            <SelectField
              id="guide-month"
              label="Mes"
              required
              options={READING_GUIDE_MONTHS.map((item) => ({
                value: item.id,
                label: item.title,
                disabled:
                  guides.some((guide) => guide.month === item.id) && item.id !== editing?.month,
              }))}
              value={month}
              onChange={setMonth}
              placeholder="Selecciona un mes"
            />
            <FileField
              id="guide-image"
              label="Imagen"
              accept="image/*"
              required={!editing}
              value={file}
              error={imageError}
              onFileChange={(selected) => {
                if (filePreview) URL.revokeObjectURL(filePreview)
                setFile(selected)
                setFilePreview(selected ? URL.createObjectURL(selected) : null)
                setImageError('')
              }}
            />
            {(filePreview || editing?.image) && (
              <img
                src={filePreview ?? editing?.image}
                alt="Vista previa de la guía"
                className="max-h-48 w-full rounded-md object-contain"
              />
            )}
            {editing && !file && (
              <p className="text-sm text-muted-foreground">
                Se conservará la imagen actual si no eliges otra.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeEditor}>
                Cancelar
              </Button>
              <Button type="submit">Guardar guía</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
