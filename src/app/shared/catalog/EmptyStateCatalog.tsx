import { EmptyState } from '@/app/shared/components/empty-state/EmptyState'

/** Desarrollo: catálogo visual del estado vacío y sus variantes de contenido. */
export function EmptyStateCatalog() {
  return (
    <main className="space-y-8 p-8" aria-labelledby="empty-state-catalog-title">
      <header>
        <h1 id="empty-state-catalog-title" className="text-2xl font-semibold">
          EmptyState
        </h1>
        <p>Mensajes accesibles para colecciones y secciones sin contenido.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <EmptyState
          title="No hay resultados"
          description="Prueba con otros términos o ajusta los filtros para encontrar lo que buscas."
        />
        <EmptyState
          title="Todavía no hay elementos"
          description="Cuando se agregue contenido, aparecerá aquí."
          className="min-h-40"
        />
      </div>
    </main>
  )
}
