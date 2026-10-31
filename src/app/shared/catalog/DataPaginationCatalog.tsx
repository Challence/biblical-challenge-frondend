import { DataPagination } from '@/app/shared/components/pagination/DataPagination'

/** Desarrollo: catálogo visual de la paginación de datos y sus estados. */
export function DataPaginationCatalog() {
  return (
    <main className="space-y-8 p-8" aria-labelledby="data-pagination-catalog-title">
      <header>
        <h1 id="data-pagination-catalog-title" className="text-2xl font-semibold">
          DataPagination
        </h1>
        <p>Resumen y navegación accesible para colecciones paginadas.</p>
      </header>
      <DataPagination
        page={2}
        totalPages={4}
        pageSize={10}
        totalItems={34}
        visibleItems={10}
        itemLabel="elementos"
        onPageChange={() => undefined}
      />
      <DataPagination
        page={1}
        totalPages={1}
        pageSize={10}
        totalItems={0}
        visibleItems={0}
        itemLabel="elementos"
        onPageChange={() => undefined}
      />
    </main>
  )
}
