import { useState } from 'react'
import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'
import { AdminPageHeader } from '@/app/shared/components/navigation/AdminPageHeader'
import { DataPagination } from '@/app/shared/components/pagination/DataPagination'
import { useModalAlert } from '@/app/shared/hooks/useModalAlert'
import * as service from '../../services/announcementService'
import { ANNOUNCEMENT_PAGE_SIZE } from '../../models/announcementCatalog'
import { useAnnouncementAdmin } from '../../hooks/useAnnouncementAdmin'
import { useAnnouncementModal } from '../../hooks/useAnnouncementModal'
import type { Announcement } from '../../models/announcement'
import { AnnouncementFilters } from '../../shared/components/specialized/AnnouncementFilters'
import { AnnouncementCard } from '../../shared/components/specialized/AnnouncementCard'
import { EmptyState } from '@/app/shared/components/empty-state/EmptyState'
export function AnnouncementListPage() {
  const [page, setPage] = useState(1),
    [search, setSearch] = useState('')
  const { warning, error } = useModalAlert()
  const admin = useAnnouncementAdmin(
    page,
    search,
    (e) =>
      void error({
        title: 'No se pudo completar la operación',
        message: e instanceof Error ? e.message : 'Intenta de nuevo.',
      }),
  )
  const openEditor = useAnnouncementModal((announcement, values) =>
    admin.save.mutateAsync({ announcement, values }),
  )
  const { query, remove, toggle, move } = admin
  const items = query.data?.items ?? []
  const removeItem = async (i: Announcement) => {
    if (
      (
        await warning({
          title: 'Eliminar anuncio',
          message: '¿Eliminar este anuncio?',
          confirmLabel: 'Eliminar',
        })
      ).action === 'confirm'
    )
      remove.mutate(i)
  }
  return (
    <section className="mx-auto max-w-[76rem]" aria-labelledby="announcements-title">
      <AdminPageHeader
        title="Anuncios"
        titleId="announcements-title"
        description="Gestiona los anuncios visibles en la aplicación."
        action={
          <Button onClick={() => void openEditor()} disabled={admin.isMutating}>
            <IconPlus aria-hidden="true" /> Nuevo anuncio
          </Button>
        }
      />
      <AnnouncementFilters
        value={search}
        onChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
      />
      {query.isLoading ? (
        <p role="status">Cargando anuncios…</p>
      ) : query.isError ? (
        <p role="alert">No se pudieron cargar los anuncios.</p>
      ) : items.length === 0 ? (
        <EmptyState
          title="No hay anuncios para mostrar"
          description="Agrega un anuncio para que aparezca en esta sección."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 min-[42rem]:grid-cols-2 min-[72rem]:grid-cols-4">
          {items.map((i, n) => (
            <AnnouncementCard
              key={i.id}
              item={i}
              index={n}
              total={items.length}
              imageUrl={service.resolveAnnouncementImageUrl(i.imageDesktopPath ?? i.imagePath)}
              disabled={admin.isMutating}
              onEdit={() => void openEditor(i)}
              onToggle={() => toggle.mutate(i)}
              onRemove={() => void removeItem(i)}
              onMove={(d) => {
                const x = [...items],
                  j = n + d
                if (j >= 0 && j < items.length && !admin.isMutating) {
                  ;[x[n], x[j]] = [x[j], x[n]]
                  move.mutate(x)
                }
              }}
            />
          ))}
        </div>
      )}
      {items.length > 0 && (
        <DataPagination
          page={page}
          totalPages={query.data?.totalPages ?? 1}
          pageSize={ANNOUNCEMENT_PAGE_SIZE}
          totalItems={query.data?.total ?? 0}
          visibleItems={items.length}
          itemLabel="anuncios"
          onPageChange={setPage}
        />
      )}
    </section>
  )
}
