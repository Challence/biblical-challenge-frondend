import { useMemo, useState } from 'react'
import { IconEdit, IconEye, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'
import { Input } from '@/app/shared/components/ui/input'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/app/shared/components/ui/pagination'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/app/shared/components/ui/table'
import { tv } from '@/app/shared/lib/tv'

const styles = tv({
  slots: {
    page: 'mx-auto max-w-[76rem]',
    breadcrumb: 'mb-3 flex items-center gap-2 text-sm text-muted-foreground',
    heading: 'mb-8 flex items-end justify-between gap-6 max-[42rem]:mb-6 max-[42rem]:items-start max-[42rem]:flex-col',
    title: 'm-0 font-[Merriweather,Georgia,serif] text-[clamp(2rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.04em] text-foreground',
    subtitle: 'mt-2 mb-0 text-muted-foreground',
    toolbar: 'mb-4 flex items-center justify-between gap-4 max-[42rem]:flex-col max-[42rem]:items-stretch',
    search: 'flex min-h-11 items-center gap-2 rounded-md border border-input bg-card px-3 text-muted-foreground max-[42rem]:w-full',
    input: 'min-w-0 flex-1 border-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground',
    tableWrap: 'overflow-x-auto rounded-[var(--shape-16)] border border-border bg-card shadow-[var(--elevation-card)]',
    status: 'inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-primary',
    actions: 'flex items-center gap-1',
    action: 'size-10 text-muted-foreground hover:bg-muted hover:text-foreground',
    pagination: 'flex items-center justify-between gap-4 py-5 text-sm text-muted-foreground max-[32rem]:items-start max-[32rem]:flex-col',
    pages: 'flex items-center gap-1',
  },
})

type Segment = { title: string; month: string; days: number; status: 'Activo' | 'Borrador' }

const segments: Segment[] = [
  { title: 'Lecturas de enero', month: 'Enero', days: 31, status: 'Activo' },
  { title: 'Desafío de cuaresma', month: 'Marzo', days: 40, status: 'Activo' },
  { title: 'Historias de esperanza', month: 'Abril', days: 30, status: 'Borrador' },
  { title: 'Mujeres de la Biblia', month: 'Mayo', days: 31, status: 'Activo' },
  { title: 'Salmos para cada día', month: 'Junio', days: 30, status: 'Activo' },
  { title: 'Camino de Adviento', month: 'Diciembre', days: 24, status: 'Borrador' },
  { title: 'Proverbios prácticos', month: 'Agosto', days: 31, status: 'Activo' },
  { title: 'Oraciones de la mañana', month: 'Septiembre', days: 30, status: 'Activo' },
]

const pageSize = 5

export function SegmentsPage() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => segments.filter(({ title }) => title.toLowerCase().includes(query.toLowerCase())), [query])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const s = styles()

  return <section className={s.page()} aria-labelledby="segments-title">
    <nav className={s.breadcrumb()} aria-label="Migas de pan"><span>Inicio</span><span aria-hidden="true">/</span><strong className="text-foreground">Segmentos</strong></nav>
    <div className={s.heading()}><div><h1 className={s.title()} id="segments-title">Segmentos</h1><p className={s.subtitle()}>Organiza y consulta los segmentos de tu contenido.</p></div><Button><IconPlus size={18} aria-hidden="true" />Crear segmento</Button></div>
    <div className={s.toolbar()}><label className={s.search()}><IconSearch size={19} aria-hidden="true" /><span className="sr-only">Buscar segmentos</span><Input className={s.input()} value={query} onChange={(event) => { setQuery(event.target.value); setPage(1) }} placeholder="Buscar segmentos..." type="search" /></label></div>
    <div className={s.tableWrap()}><Table><TableCaption className="sr-only">Lista de segmentos</TableCaption><TableHeader><TableRow><TableHead>Título</TableHead><TableHead>Mes</TableHead><TableHead>Días definidos</TableHead><TableHead>Estatus</TableHead><TableHead>Acciones</TableHead></TableRow></TableHeader><TableBody>{visible.map((segment) => <TableRow key={segment.title}><TableCell className="font-bold">{segment.title}</TableCell><TableCell>{segment.month}</TableCell><TableCell>{segment.days}</TableCell><TableCell><span className={s.status()}>{segment.status}</span></TableCell><TableCell><div className={s.actions()}><Button variant="ghost" size="icon" className={s.action()} aria-label={`Ver ${segment.title}`}><IconEye size={18} aria-hidden="true" /></Button><Button variant="ghost" size="icon" className={s.action()} aria-label={`Editar ${segment.title}`}><IconEdit size={18} aria-hidden="true" /></Button><Button variant="ghost" size="icon" className={`${s.action()} hover:text-destructive`} aria-label={`Eliminar ${segment.title}`}><IconTrash size={18} aria-hidden="true" /></Button></div></TableCell></TableRow>)}</TableBody></Table>{visible.length === 0 && <p className="p-8 text-center text-muted-foreground">No encontramos segmentos con esa búsqueda.</p>}</div>
    <div className={s.pagination()}><span>Mostrando {visible.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} de {filtered.length} segmentos</span><Pagination className={s.pages()}><PaginationContent><PaginationItem><PaginationPrevious href="#" aria-label="Página anterior" onClick={(event) => { event.preventDefault(); if (currentPage > 1) setPage(currentPage - 1) }} /></PaginationItem><PaginationItem><PaginationLink href="#" isActive aria-label={`Página ${currentPage}`}>{currentPage}</PaginationLink></PaginationItem><PaginationItem><PaginationNext href="#" aria-label="Página siguiente" onClick={(event) => { event.preventDefault(); if (currentPage < totalPages) setPage(currentPage + 1) }} /></PaginationItem></PaginationContent></Pagination></div>
  </section>
}
