import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconBold, IconChevronLeft, IconChevronRight, IconItalic, IconLink, IconList, IconPhoto, IconUnderline, IconUpload } from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/shared/components/ui/card'
import { Input } from '@/app/shared/components/ui/input'
import { Label } from '@/app/shared/components/ui/label'
import { Textarea } from '@/app/shared/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/shared/components/ui/dialog'
import { saveActiveSegmentCover } from './segmentStorage'

const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const weekday = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

export function NewSegmentPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [month, setMonth] = useState('')
  const [description, setDescription] = useState('')
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth())
  const [selected, setSelected] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [dayContent, setDayContent] = useState<Record<number, { video: string; text: string }>>({})
  const [draft, setDraft] = useState({ video: '', text: '' })
  const [cover, setCover] = useState('')
  const [coverError, setCoverError] = useState('')
  const year = new Date().getFullYear()
  const firstDay = new Date(year, calendarMonth, 1).getDay()
  const offset = (firstDay + 6) % 7
  const days = new Date(year, calendarMonth + 1, 0).getDate()
  const openDay = (day: number) => { setEditingDay(day); setDraft(dayContent[day] ?? { video: '', text: '' }) }
  const saveDay = () => { if (editingDay === null) return; setDayContent((current) => ({ ...current, [editingDay]: draft })); setSelected((current) => current.includes(editingDay) ? current : [...current, editingDay].sort((a,b) => a-b)); setEditingDay(null) }
  const invalid = submitted && (!title.trim() || !month || selected.length === 0)
   const save = (event: FormEvent) => { event.preventDefault(); setSubmitted(true); if (!title.trim() || !month || selected.length === 0) return; if (cover) saveActiveSegmentCover(cover); navigate('/admin/segmentos') }
   const selectCover = (file: File | undefined) => { if (!file) return; if (!file.type.startsWith('image/')) { setCoverError('Selecciona un archivo de imagen válido.'); return }; if (file.size > 5 * 1024 * 1024) { setCoverError('La imagen no puede superar los 5 MB.'); return }; setCoverError(''); const reader = new FileReader(); reader.onload = () => setCover(typeof reader.result === 'string' ? reader.result : ''); reader.readAsDataURL(file) }
  return <section className="mx-auto max-w-[76rem]" aria-labelledby="new-segment-title">
    <nav className="mb-3 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Migas de pan"><span>Segmentos</span><span aria-hidden="true">/</span><strong className="text-foreground">Nuevo segmento</strong></nav>
    <h1 id="new-segment-title" className="mb-5 font-[Merriweather,Georgia,serif] text-[clamp(1.75rem,3.5vw,2.25rem)] leading-tight tracking-[-0.04em]">Nuevo segmento</h1>
    <form onSubmit={save} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card><CardHeader className="p-4 pb-3"><CardTitle className="text-lg">Información del segmento</CardTitle></CardHeader><CardContent className="space-y-4 px-4 pb-4">
        <div className="space-y-1.5"><Label htmlFor="segment-title">Título <span aria-hidden="true">*</span></Label><Input id="segment-title" value={title} onChange={(e) => setTitle(e.target.value)} aria-required="true" aria-invalid={submitted && !title.trim()} aria-describedby={submitted && !title.trim() ? 'title-error' : undefined} placeholder="Ej. Lecturas de enero" />{submitted && !title.trim() && <p id="title-error" className="text-sm text-destructive">El título es obligatorio.</p>}</div>
        <div className="space-y-1.5"><Label htmlFor="segment-month">Mes <span aria-hidden="true">*</span></Label><select id="segment-month" value={month} onChange={(e) => setMonth(e.target.value)} aria-required="true" aria-invalid={submitted && !month} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="">Selecciona un mes</option>{months.map((item) => <option key={item}>{item}</option>)}</select>{submitted && !month && <p className="text-sm text-destructive">Selecciona un mes.</p>}</div>
         <div className="space-y-1.5"><Label htmlFor="segment-description">Descripción <span className="font-normal text-muted-foreground">(opcional)</span></Label><Textarea id="segment-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe brevemente este segmento" /></div><div className="space-y-2"><Label htmlFor="segment-cover">Imagen de portada <span className="font-normal text-muted-foreground">(opcional)</span></Label><label htmlFor="segment-cover" className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-input px-3 py-2 text-sm hover:bg-muted"><IconUpload size={18} aria-hidden="true" />{cover ? 'Cambiar imagen' : 'Seleccionar imagen'}<input id="segment-cover" className="sr-only" type="file" accept="image/*" onChange={(e) => selectCover(e.target.files?.[0])} /></label>{coverError && <p className="text-sm text-destructive" role="alert">{coverError}</p>}{cover && <img src={cover} alt="Vista previa de la portada" className="h-32 w-full rounded-md object-cover" />}</div>
         <div className="flex flex-wrap gap-2 pt-1"><Button type="submit">Guardar segmento</Button><Button type="button" variant="outline" onClick={() => navigate('/admin/segmentos')}>Cancelar</Button></div>
      </CardContent></Card>
      <Card><CardHeader className="p-4 pb-3"><CardTitle className="text-lg">Calendario mensual</CardTitle><p className="text-sm text-muted-foreground">Selecciona los días que formarán parte del segmento.</p></CardHeader><CardContent className="px-4 pb-4">
        <div className="mb-3 flex items-center justify-between"><Button type="button" variant="ghost" size="icon" aria-label="Mes anterior" onClick={() => setCalendarMonth((calendarMonth + 11) % 12)}><IconChevronLeft /></Button><strong>{months[calendarMonth]} {year}</strong><Button type="button" variant="ghost" size="icon" aria-label="Mes siguiente" onClick={() => setCalendarMonth((calendarMonth + 1) % 12)}><IconChevronRight /></Button></div>
         <div className="grid grid-cols-7 gap-px text-center text-sm" role="grid" aria-label={`Calendario de ${months[calendarMonth]}`}><div className="contents">{weekday.map((day) => <span key={day} className="py-1 text-xs font-bold text-muted-foreground">{day}</span>)}</div>{Array.from({length: offset}, (_, index) => <span key={`empty-${index}`} />)}{Array.from({length: days}, (_, index) => { const day=index+1; const active=selected.includes(day); return <button type="button" key={day} onClick={() => openDay(day)} aria-label={`Día ${day}${active ? ', configurado' : ''}`} aria-pressed={active} className={`relative h-10 w-10 justify-self-center rounded-md border text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-transparent hover:border-border hover:bg-muted'}`}>{day}{active && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current" aria-hidden="true" />}</button> })}</div>
        <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">{selected.length} {selected.length === 1 ? 'día seleccionado' : 'días seleccionados'}</p>{submitted && selected.length === 0 && <p className="mt-2 text-sm text-destructive">Selecciona al menos un día.</p>}
      </CardContent></Card>
    </form>
    {invalid && <p className="sr-only" role="alert">Completa los campos obligatorios y selecciona al menos un día.</p>}
    <Dialog open={editingDay !== null} onOpenChange={(open) => !open && setEditingDay(null)}><DialogContent aria-labelledby="day-dialog-title" aria-describedby="day-dialog-description"><DialogHeader><DialogTitle id="day-dialog-title">{editingDay ? `${months[calendarMonth]} ${editingDay}` : ''}</DialogTitle><DialogDescription id="day-dialog-description">Edita el contenido de este día del segmento.</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-1.5"><Label htmlFor="day-video">Video o enlace</Label><Input data-autofocus id="day-video" value={draft.video} onChange={(e) => setDraft({ ...draft, video: e.target.value })} placeholder="https://..." /></div><div className="space-y-1.5"><Label htmlFor="day-content">Contenido de lectura</Label><div className="flex flex-wrap gap-1 rounded-t-md border border-b-0 p-1" aria-label="Herramientas de formato">{[[IconBold, 'Negrita'], [IconItalic, 'Cursiva'], [IconUnderline, 'Subrayado'], [IconList, 'Lista'], [IconLink, 'Enlace'], [IconPhoto, 'Imagen']].map(([Icon, label]) => <Button key={label as string} type="button" variant="ghost" size="icon" aria-label={label as string}><Icon /></Button>)}</div><Textarea id="day-content" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} className="min-h-32 rounded-t-none" placeholder="Escribe la lectura del día..." /></div><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setEditingDay(null)}>Cancelar</Button><Button type="button" onClick={saveDay}>Guardar</Button></div></div></DialogContent></Dialog>
  </section>
}
