import { useEffect, useRef, useState } from 'react'
import {
  IconArrowDown,
  IconArrowUp,
  IconEdit,
  IconPlus,
  IconPower,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'
import { Card, CardContent } from '@/app/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'
import { Input } from '@/app/shared/components/ui/input'
import { Label } from '@/app/shared/components/ui/label'
import { Textarea } from '@/app/shared/components/ui/textarea'
import { FileField } from '@/app/shared/components/fields/base/FileField'
import { tv } from '@/app/shared/lib/tv'
import { AdminBreadcrumb } from '@/app/shared/components/navigation/AdminBreadcrumb'

type Announcement = {
  id: number
  image: string
  title: string
  description: string
  href: string
  active: boolean
}
type Form = Omit<Announcement, 'id' | 'active'>

const initial: Announcement[] = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=900&q=80',
    title: 'Un nuevo desafío te espera',
    description: 'Descubre la lectura bíblica de hoy y continúa tu camino.',
    href: '/lectura-hoy',
    active: true,
  },
  {
    id: 2,
    image:
      'https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&w=900&q=80',
    title: 'Comparte tu fe',
    description: 'Invita a tus amigos a vivir juntos esta experiencia.',
    href: '/guia',
    active: true,
  },
]

const styles = tv({
  slots: {
    page: 'mx-auto max-w-[76rem]',
    heading:
      'mb-8 flex items-end justify-between gap-6 max-[42rem]:mb-6 max-[42rem]:items-start max-[42rem]:flex-col',
    title:
      'm-0 font-[Merriweather,Georgia,serif] text-[clamp(2rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.04em]',
    subtitle: 'mt-2 mb-0 text-muted-foreground',
    grid: 'grid grid-cols-1 gap-3 min-[42rem]:grid-cols-2 min-[72rem]:grid-cols-4',
    image: 'aspect-[16/7] w-full object-cover',
    body: 'grid min-w-0 gap-2 p-3',
    actions:
      'mt-1 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-2 border-t border-border pt-2',
    leftActions: 'flex min-w-0 flex-wrap gap-1',
    small: 'text-xs text-muted-foreground',
    form: 'grid gap-4',
    field: 'grid gap-2',
    order: 'flex shrink-0 gap-1',
  },
})

const emptyForm: Form = { image: '', title: '', description: '', href: '' }

export function AnnouncementsPage() {
  const s = styles()
  const [items, setItems] = useState(initial)
  const [editing, setEditing] = useState<Announcement | null>(null)
  const [form, setForm] = useState<Form>(emptyForm)
  const [file, setFile] = useState<File | null>(null)
  const [open, setOpen] = useState(false)
  const objectUrls = useRef<string[]>([])
  useEffect(
    () => () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    },
    [],
  )
  const startCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFile(null)
    setOpen(true)
  }
  const startEdit = (item: Announcement) => {
    setEditing(item)
    setForm({
      image: item.image,
      title: item.title,
      description: item.description,
      href: item.href,
    })
    setFile(null)
    setOpen(true)
  }
  const save = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.image || !form.title || !form.description || !form.href) return
    if (editing)
      setItems(items.map((item) => (item.id === editing.id ? { ...item, ...form } : item)))
    else setItems([...items, { ...form, id: Date.now(), active: true }])
    setOpen(false)
  }
  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction
    if (next < 0 || next >= items.length) return
    const copy = [...items]
    ;[copy[index], copy[next]] = [copy[next], copy[index]]
    setItems(copy)
  }
  const update = (key: keyof Form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }))
  const updateFile = (selectedFile: File | null) => {
    setFile(selectedFile)
    if (selectedFile) {
      const imageUrl = URL.createObjectURL(selectedFile)
      objectUrls.current.push(imageUrl)
      update('image', imageUrl)
    }
  }
  return (
    <section className={s.page()} aria-labelledby="announcements-title">
      <AdminBreadcrumb
        items={[{ label: 'Inicio', to: '/admin' }]}
        currentLabel="Anuncios"
        backTo="/admin"
      />
      <div className={s.heading()}>
        <div>
          <h1 className={s.title()} id="announcements-title">
            Anuncios
          </h1>
          <p className={s.subtitle()}>Gestiona los anuncios visibles en la aplicación.</p>
        </div>
        <Button onClick={startCreate}>
          <IconPlus aria-hidden="true" />
          Nuevo anuncio
        </Button>
      </div>
      <p className="mb-6 rounded-md border border-secondary/30 bg-secondary/10 p-3 text-sm text-muted-foreground">
        Demo de backoffice: los cambios se mantienen solo en memoria y no tienen persistencia.
      </p>
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No hay anuncios. Crea el primero para comenzar.
          </CardContent>
        </Card>
      ) : (
        <div className={s.grid()}>
          {items.map((item, index) => (
            <Card key={item.id} className="overflow-hidden">
              <img className={s.image()} src={item.image} alt="" />
              <CardContent className={s.body()}>
                <div className="min-w-0">
                  <h2 className="break-words text-base font-bold">{item.title}</h2>
                  <p className={s.small()}>{item.href}</p>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <div className={s.actions()}>
                  <div className={s.leftActions()}>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Editar ${item.title}`}
                      title={`Editar ${item.title}`}
                      onClick={() => startEdit(item)}
                    >
                      <IconEdit aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={
                        item.active ? `Desactivar ${item.title}` : `Activar ${item.title}`
                      }
                      title={item.active ? `Desactivar ${item.title}` : `Activar ${item.title}`}
                      onClick={() =>
                        setItems(
                          items.map((entry) =>
                            entry.id === item.id ? { ...entry, active: !entry.active } : entry,
                          ),
                        )
                      }
                    >
                      <IconPower aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Eliminar ${item.title}`}
                      title={`Eliminar ${item.title}`}
                      onClick={() => setItems(items.filter((entry) => entry.id !== item.id))}
                    >
                      <IconTrash aria-hidden="true" />
                    </Button>
                  </div>
                  <span className={s.order()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Subir anuncio"
                      title="Subir anuncio"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <IconArrowUp aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Bajar anuncio"
                      title="Bajar anuncio"
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <IconArrowDown aria-hidden="true" />
                    </Button>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (!nextOpen) setFile(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar anuncio' : 'Nuevo anuncio'}</DialogTitle>
            <DialogDescription>
              Completa todos los campos requeridos para la vista pública.
            </DialogDescription>
          </DialogHeader>
          <form className={s.form()} onSubmit={save}>
            <div className={s.field()}>
              <Label htmlFor="announcement-title">Título *</Label>
              <Input
                id="announcement-title"
                required
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
              />
            </div>
            <div className={s.field()}>
              <Label htmlFor="announcement-description">Descripción *</Label>
              <Textarea
                id="announcement-description"
                required
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
              />
            </div>
            <div className={s.field()}>
              <Label htmlFor="announcement-href">Enlace (href) *</Label>
              <Input
                id="announcement-href"
                required
                value={form.href}
                onChange={(e) => update('href', e.target.value)}
                placeholder="/lectura-hoy"
              />
            </div>
            <FileField
              id="announcement-image"
              label="Imagen o fondo"
              accept="image/*"
              required={!editing || !form.image}
              value={file}
              onFileChange={updateFile}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                <IconX aria-hidden="true" />
                Cancelar
              </Button>
              <Button type="submit">Guardar anuncio</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}
