import { useState } from 'react'
import { IconArrowDown, IconArrowUp, IconEdit, IconPlus, IconPower, IconTrash, IconX } from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'
import { Card, CardContent } from '@/app/shared/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/shared/components/ui/dialog'
import { Input } from '@/app/shared/components/ui/input'
import { Label } from '@/app/shared/components/ui/label'
import { Textarea } from '@/app/shared/components/ui/textarea'
import { tv } from '@/app/shared/lib/tv'

type Announcement = { id: number; image: string; title: string; description: string; href: string; active: boolean }
type Form = Omit<Announcement, 'id' | 'active'>

const initial: Announcement[] = [
  { id: 1, image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=900&q=80', title: 'Un nuevo desafío te espera', description: 'Descubre la lectura bíblica de hoy y continúa tu camino.', href: '/lectura-hoy', active: true },
  { id: 2, image: 'https://images.unsplash.com/photo-1473177104440-ffee2f376098?auto=format&fit=crop&w=900&q=80', title: 'Comparte tu fe', description: 'Invita a tus amigos a vivir juntos esta experiencia.', href: '/guia', active: true },
]

const styles = tv({ slots: {
  page: 'mx-auto max-w-[76rem]', heading: 'mb-8 flex items-end justify-between gap-6 max-[42rem]:mb-6 max-[42rem]:items-start max-[42rem]:flex-col', title: 'm-0 font-[Merriweather,Georgia,serif] text-[clamp(2rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.04em]', subtitle: 'mt-2 mb-0 text-muted-foreground', grid: 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-5', image: 'aspect-[16/8] w-full object-cover', body: 'grid gap-3', actions: 'mt-2 flex flex-wrap gap-2 border-t border-border pt-3', small: 'text-xs text-muted-foreground', badge: 'inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold', form: 'grid gap-4', field: 'grid gap-2', order: 'ml-auto flex gap-1', }} )

const emptyForm: Form = { image: '', title: '', description: '', href: '' }

export function AnnouncementsPage() {
  const s = styles(); const [items, setItems] = useState(initial); const [editing, setEditing] = useState<Announcement | null>(null); const [form, setForm] = useState<Form>(emptyForm); const [open, setOpen] = useState(false)
  const startCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true) }
  const startEdit = (item: Announcement) => { setEditing(item); setForm({ image: item.image, title: item.title, description: item.description, href: item.href }); setOpen(true) }
  const save = (event: React.FormEvent) => { event.preventDefault(); if (!form.image || !form.title || !form.description || !form.href) return; if (editing) setItems(items.map((item) => item.id === editing.id ? { ...item, ...form } : item)); else setItems([...items, { ...form, id: Date.now(), active: true }]); setOpen(false) }
  const move = (index: number, direction: -1 | 1) => { const next = index + direction; if (next < 0 || next >= items.length) return; const copy = [...items]; [copy[index], copy[next]] = [copy[next], copy[index]]; setItems(copy) }
  const update = (key: keyof Form, value: string) => setForm((current) => ({ ...current, [key]: value }))
  return <section className={s.page()} aria-labelledby="announcements-title">
    <nav className="mb-3 flex gap-2 text-sm text-muted-foreground" aria-label="Migas de pan"><span>Inicio</span><span aria-hidden="true">/</span><strong className="text-foreground">Anuncios</strong></nav>
    <div className={s.heading()}><div><h1 className={s.title()} id="announcements-title">Anuncios</h1><p className={s.subtitle()}>Gestiona los anuncios visibles en la aplicación.</p></div><Button onClick={startCreate}><IconPlus aria-hidden="true" />Nuevo anuncio</Button></div>
    <p className="mb-6 rounded-md border border-secondary/30 bg-secondary/10 p-3 text-sm text-muted-foreground">Demo de backoffice: los cambios se mantienen solo en memoria y no tienen persistencia.</p>
    {items.length === 0 ? <Card><CardContent className="p-8 text-center text-muted-foreground">No hay anuncios. Crea el primero para comenzar.</CardContent></Card> : <div className={s.grid()}>{items.map((item, index) => <Card key={item.id} className="overflow-hidden"><img className={s.image()} src={item.image} alt="" /><CardContent className={s.body()}><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{item.title}</h2><p className={s.small()}>{item.href}</p></div><span className={`${s.badge()} ${item.active ? 'bg-secondary/15 text-primary' : 'bg-muted text-muted-foreground'}`}>{item.active ? 'Activo' : 'Inactivo'}</span></div><p className="text-sm text-muted-foreground">{item.description}</p><div className={s.actions()}><Button variant="outline" size="sm" onClick={() => startEdit(item)}><IconEdit aria-hidden="true" />Editar</Button><Button variant="ghost" size="sm" onClick={() => setItems(items.map((entry) => entry.id === item.id ? { ...entry, active: !entry.active } : entry))}><IconPower aria-hidden="true" />{item.active ? 'Desactivar' : 'Activar'}</Button><Button variant="ghost" size="icon" aria-label={`Eliminar ${item.title}`} onClick={() => setItems(items.filter((entry) => entry.id !== item.id))}><IconTrash aria-hidden="true" /></Button><span className={s.order()}><Button variant="ghost" size="icon" aria-label="Subir anuncio" disabled={index === 0} onClick={() => move(index, -1)}><IconArrowUp aria-hidden="true" /></Button><Button variant="ghost" size="icon" aria-label="Bajar anuncio" disabled={index === items.length - 1} onClick={() => move(index, 1)}><IconArrowDown aria-hidden="true" /></Button></span></div></CardContent></Card>)}</div>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? 'Editar anuncio' : 'Nuevo anuncio'}</DialogTitle><DialogDescription>Completa todos los campos requeridos para la vista pública.</DialogDescription></DialogHeader><form className={s.form()} onSubmit={save}><div className={s.field()}><Label htmlFor="announcement-image">Imagen o fondo *</Label><Input id="announcement-image" type="url" required value={form.image} onChange={(e) => update('image', e.target.value)} placeholder="https://..." /></div><div className={s.field()}><Label htmlFor="announcement-title">Título *</Label><Input id="announcement-title" required value={form.title} onChange={(e) => update('title', e.target.value)} /></div><div className={s.field()}><Label htmlFor="announcement-description">Descripción *</Label><Textarea id="announcement-description" required value={form.description} onChange={(e) => update('description', e.target.value)} /></div><div className={s.field()}><Label htmlFor="announcement-href">Enlace (href) *</Label><Input id="announcement-href" required value={form.href} onChange={(e) => update('href', e.target.value)} placeholder="/lectura-hoy" /></div><div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setOpen(false)}><IconX aria-hidden="true" />Cancelar</Button><Button type="submit">Guardar anuncio</Button></div></form></DialogContent></Dialog>
  </section>
}
