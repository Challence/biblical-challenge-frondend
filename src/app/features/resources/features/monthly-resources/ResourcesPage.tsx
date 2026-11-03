import { useState } from 'react'
import { Button } from '@/app/shared/components/ui/button'
import { Empty } from '@/app/shared/components/empty/Empty'
import { DataPagination } from '@/app/shared/components/pagination/DataPagination'
import { PublicResourceMonthList } from './shared/components/specialized/PublicResourceMonthList'
import { RESOURCE_MONTH_PAGE_SIZE, usePublicResourceMonths } from './hooks/usePublicResourceMonths'

export function ResourcesPage() {
  const [page, setPage] = useState(1)
  const months = usePublicResourceMonths(page)
  const items = months.data?.items ?? []
  const isEmpty = !months.isLoading && !months.error && items.length === 0
  return (
    <main
      className={`mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6${
        isEmpty ? ' flex min-h-full items-center justify-center' : ''
      }`}
    >
      {!isEmpty && (
        <header className="max-w-2xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Recursos</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            Recursos de cada mes
          </h1>
          <p className="text-muted-foreground">
            Imágenes, encuentros y videos para acompañar tu camino.
          </p>
        </header>
      )}
      {months.isLoading ? (
        <p role="status">Cargando recursos…</p>
      ) : months.error ? (
        <div role="alert">
          <p>No se pudieron cargar los recursos.</p>
          <Button variant="ghost" onClick={() => void months.refetch()}>
            Reintentar
          </Button>
        </div>
      ) : isEmpty ? (
        <Empty size="lg" msg="No hay recursos agregados" />
      ) : (
        <>
          <PublicResourceMonthList months={items} />
          <DataPagination
            page={page}
            totalPages={months.data?.totalPages ?? 1}
            pageSize={RESOURCE_MONTH_PAGE_SIZE}
            totalItems={months.data?.total ?? 0}
            visibleItems={items.length}
            itemLabel="meses"
            onPageChange={setPage}
            disabled={months.isFetching}
          />
        </>
      )}
    </main>
  )
}
