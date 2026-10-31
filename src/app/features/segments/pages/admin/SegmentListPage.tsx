import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconEdit, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'
import { Input } from '@/app/shared/components/ui/input'
import { DataPagination } from '@/app/shared/components/pagination/DataPagination'
import { DataTable } from '@/app/shared/components/table/DataTable'
import { tv } from '@/app/shared/lib/tv'
import { AdminBreadcrumb } from '@/app/shared/components/navigation/AdminBreadcrumb'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteSegment, listSegments, updateSegmentStatus } from '../../services/segmentService'
import { SEGMENT_LIST_PAGE_SIZE, SEGMENT_MONTHS } from '../../models/segmentCatalog'
import { SegmentStatusSwitch } from '../../shared/components/specialized/SegmentStatusSwitch'
import { useModalAlert } from '@/app/shared/hooks/useModalAlert'

const styles = tv({
  slots: {
    page: 'mx-auto max-w-[76rem]',
    breadcrumb: 'mb-3 flex items-center gap-2 text-sm text-muted-foreground',
    heading:
      'mb-8 flex items-end justify-between gap-6 max-[42rem]:mb-6 max-[42rem]:items-start max-[42rem]:flex-col',
    title:
      'm-0 font-[Merriweather,Georgia,serif] text-[clamp(2rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.04em] text-foreground',
    subtitle: 'mt-2 mb-0 text-muted-foreground',
    toolbar:
      'mb-4 flex items-center justify-between gap-4 max-[42rem]:flex-col max-[42rem]:items-stretch',
    search:
      'flex min-h-11 items-center gap-2 rounded-md border border-input bg-card px-3 text-muted-foreground max-[42rem]:w-full',
    input:
      'min-w-0 flex-1 border-0 bg-transparent text-foreground outline-none placeholder:text-muted-foreground',
    tableWrap:
      'overflow-x-auto rounded-[var(--shape-16)] border border-border bg-card shadow-[var(--elevation-card)]',
    status: 'inline-flex rounded-full bg-secondary/10 px-3 py-1 text-xs font-bold text-primary',
    actions: 'flex items-center gap-1',
    action: 'size-10 text-muted-foreground hover:bg-muted hover:text-foreground',
  },
})

export function SegmentsPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [pendingStatusIds, setPendingStatusIds] = useState<Set<string>>(() => new Set())
  const pendingStatusIdsRef = useRef(new Set<string>())
  const queryClient = useQueryClient()
  const { warning } = useModalAlert()
  const { data, isLoading, isError } = useQuery({
    queryKey: ['segments', page, query],
    queryFn: () => listSegments(page, SEGMENT_LIST_PAGE_SIZE, query),
  })
  const remove = async (id: string) => {
    const result = await warning({
      title: 'Eliminar segmento',
      message: '¿Eliminar este segmento?',
    })
    if (result.action === 'confirm') {
      await deleteSegment(id)
      await queryClient.invalidateQueries({ queryKey: ['segments'] })
    }
  }
  const toggleStatus = async (id: string, status: 'draft' | 'active') => {
    if (pendingStatusIdsRef.current.has(id)) return

    pendingStatusIdsRef.current.add(id)
    setPendingStatusIds(new Set(pendingStatusIdsRef.current))
    try {
      await updateSegmentStatus(id, status === 'active' ? 'draft' : 'active')
      await queryClient.invalidateQueries({ queryKey: ['segments'] })
    } finally {
      pendingStatusIdsRef.current.delete(id)
      setPendingStatusIds(new Set(pendingStatusIdsRef.current))
    }
  }
  const totalPages = data?.totalPages ?? 1
  const visible = data?.items ?? []
  const s = styles()

  return (
    <section className={s.page()} aria-labelledby="segments-title">
      <AdminBreadcrumb
        items={[{ label: 'Inicio', to: '/admin' }]}
        currentLabel="Segmentos"
        backTo="/admin"
      />
      <div className={s.heading()}>
        <div>
          <h1 className={s.title()} id="segments-title">
            Segmentos
          </h1>
          <p className={s.subtitle()}>Organiza y consulta los segmentos de tu contenido.</p>
        </div>
        <Button onClick={() => navigate('/admin/segmentos/nuevo')}>
          <IconPlus size={18} aria-hidden="true" />
          Crear segmento
        </Button>
      </div>
      <div className={s.toolbar()}>
        <label className={s.search()}>
          <IconSearch size={19} aria-hidden="true" />
          <span className="sr-only">Buscar segmentos</span>
          <Input
            className={s.input()}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Buscar segmentos..."
            type="search"
          />
        </label>
      </div>
      <div className={s.tableWrap()}>
        <DataTable
          caption="Lista de segmentos"
          columns={[
            {
              key: 'title',
              header: 'Título',
              className: 'font-bold',
              cell: (segment) => segment.title,
            },
            {
              key: 'month',
              header: 'Mes',
              cell: (segment) => `${SEGMENT_MONTHS[segment.month - 1]} ${segment.year}`,
            },
            { key: 'days', header: 'Días definidos', cell: (segment) => segment.days },
            {
              key: 'status',
              header: 'Estatus',
              cell: (segment) => <span className={s.status()}>{segment.status}</span>,
            },
            {
              key: 'actions',
              header: 'Acciones',
              cell: (segment) => (
                <div className={s.actions()}>
                  <SegmentStatusSwitch
                    title={segment.title}
                    status={segment.status}
                    disabled={pendingStatusIds.has(segment.id)}
                    onToggle={() => void toggleStatus(segment.id, segment.status)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className={s.action()}
                    aria-label={`Editar ${segment.title}`}
                    onClick={() => navigate(`/admin/segmentos/${segment.id}/editar`)}
                  >
                    <IconEdit size={18} aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`${s.action()} hover:text-destructive`}
                    aria-label={`Eliminar ${segment.title}`}
                    onClick={() => void remove(segment.id)}
                  >
                    <IconTrash size={18} aria-hidden="true" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={visible}
          error={isError ? 'No se pudieron cargar los segmentos.' : undefined}
          empty="No encontramos segmentos con esa búsqueda."
          getRowId={(segment) => segment.id}
          loading={isLoading}
          loadingMessage="Cargando segmentos…"
        />
      </div>
      <DataPagination
        page={page}
        totalPages={totalPages}
        pageSize={SEGMENT_LIST_PAGE_SIZE}
        totalItems={data?.total ?? 0}
        visibleItems={visible.length}
        itemLabel="segmentos"
        onPageChange={setPage}
      />
    </section>
  )
}
