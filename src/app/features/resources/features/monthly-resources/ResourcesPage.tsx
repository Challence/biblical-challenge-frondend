import { useState } from 'react'
import { Button } from '@/app/shared/components/ui/button'
import { DataPagination } from '@/app/shared/components/pagination/DataPagination'
import { PublicResourceMonthList } from './shared/components/specialized/PublicResourceMonthList'
import { RESOURCE_MONTH_PAGE_SIZE, usePublicResourceMonths } from './hooks/usePublicResourceMonths'

export function ResourcesPage() {
  const [page, setPage] = useState(1)
  const months = usePublicResourceMonths(page)
  const items = months.data?.items ?? []
  return (
    <main className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6">
      <header className="max-w-2xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Recursos</p>
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Recursos de cada mes
        </h1>
        <p className="text-muted-foreground">
          Imágenes, encuentros y videos para acompañar tu camino.
        </p>
      </header>
      {months.isLoading ? (
        <p role="status">Cargando recursos…</p>
      ) : months.error ? (
        <div role="alert">
          <p>No se pudieron cargar los recursos.</p>
          <Button variant="ghost" onClick={() => void months.refetch()}>
            Reintentar
          </Button>
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-muted-foreground">
          Aún no hay recursos publicados.
        </p>
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
