import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconArrowDown,
  IconArrowUp,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react'
import { ShareButton } from '@/app/shared/components/share/ShareButton'
import { Button } from '@/app/shared/components/ui/button'
import { Input } from '@/app/shared/components/ui/input'
import { DataPagination } from '@/app/shared/components/pagination/DataPagination'
import { DataTable } from '@/app/shared/components/table/DataTable'
import { EmptyState } from '@/app/shared/components/empty-state/EmptyState'
import { tv } from '@/app/shared/lib/tv'
import { AdminPageHeader } from '@/app/shared/components/navigation/AdminPageHeader'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteSegment,
  listSegments,
  reorderSegments,
  updateSegmentStatus,
} from '../../services/segmentService'
import { SEGMENT_LIST_PAGE_SIZE, SEGMENT_MONTHS } from '../../models/segmentCatalog'
import { SegmentStatusSwitch } from '../../shared/components/specialized/SegmentStatusSwitch'
import { useModalAlert } from '@/app/shared/hooks/useModalAlert'

const publicSegmentQueryKeys = [
  ['public-segments'],
  ['public-segment'],
  ['public-segment-by-id'],
] as const

const styles = tv({
  slots: {
    page: 'mx-auto max-w-[76rem]',
    breadcrumb: 'mb-3 flex items-center gap-2 text-sm text-muted-foreground',
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
  const [isReordering, setIsReordering] = useState(false)
  const isReorderingRef = useRef(false)
  const pendingStatusIdsRef = useRef(new Set<string>())
  const queryClient = useQueryClient()
  const invalidateSegments = async () => {
    await queryClient.invalidateQueries({ queryKey: ['segments'] })
    await Promise.all(
      publicSegmentQueryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    )
  }
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
      await invalidateSegments()
    }
  }
  const toggleStatus = async (id: string, status: 'draft' | 'active') => {
    if (pendingStatusIdsRef.current.has(id)) return

    pendingStatusIdsRef.current.add(id)
    setPendingStatusIds(new Set(pendingStatusIdsRef.current))
    try {
      await updateSegmentStatus(id, status === 'active' ? 'draft' : 'active')
      await invalidateSegments()
    } finally {
      pendingStatusIdsRef.current.delete(id)
      setPendingStatusIds(new Set(pendingStatusIdsRef.current))
    }
  }
  const move = async (index: number, direction: -1 | 1) => {
    if (isReorderingRef.current) return
    const otherIndex = index + direction
    const other = visible[otherIndex]
    const current = visible[index]
    if (!current || !other) return

    isReorderingRef.current = true
    setIsReordering(true)
    try {
      await reorderSegments(current.id, current.position, other.id, other.position)
      await invalidateSegments()
    } finally {
      isReorderingRef.current = false
      setIsReordering(false)
    }
  }
  const totalPages = data?.totalPages ?? 1
  const visible = data?.items ?? []
  const s = styles()

  return (
    <section className={s.page()} aria-labelledby="segments-title">
      <AdminPageHeader
        title="Segmentos"
        titleId="segments-title"
        description="Organiza y consulta los segmentos de tu contenido."
        action={
          <Button onClick={() => navigate('/admin/segmentos/nuevo')}>
            <IconPlus size={18} aria-hidden="true" />
            Crear segmento
          </Button>
        }
      />
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
              key: 'position',
              header: 'Orden',
              cell: (segment) => {
                const index = visible.findIndex((item) => item.id === segment.id)
                return (
                  <div className={s.actions()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={s.action()}
                      aria-label={`Subir ${segment.title}`}
                      disabled={isReordering || index <= 0}
                      onClick={() => void move(index, -1)}
                    >
                      <IconArrowUp size={18} aria-hidden="true" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={s.action()}
                      aria-label={`Bajar ${segment.title}`}
                      disabled={isReordering || index === visible.length - 1}
                      onClick={() => void move(index, 1)}
                    >
                      <IconArrowDown size={18} aria-hidden="true" />
                    </Button>
                  </div>
                )
              },
            },
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
                  <fieldset
                    disabled={segment.status === 'draft'}
                    aria-label={
                      segment.status === 'draft'
                        ? `Compartir ${segment.title}: disponible al publicar el segmento`
                        : `Compartir ${segment.title}`
                    }
                    className="border-0 p-0"
                  >
                    <ShareButton
                      content={{
                        kind: 'segment',
                        data: segment,
                        publicUrl: `${window.location.origin}/segmentos/${segment.slug}`,
                        entityId: segment.id,
                      }}
                      variant="admin"
                      accessibleLabel={`Compartir ${segment.title}`}
                    />
                  </fieldset>
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
          empty={
            <EmptyState
              title="No encontramos segmentos"
              description="Prueba con otros términos de búsqueda."
              className="border-0 bg-transparent"
            />
          }
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
