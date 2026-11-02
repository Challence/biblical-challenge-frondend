import { useQuery } from '@tanstack/react-query'
import { listReadingGuides } from './services/readingGuideService'
import { PublicReadingGuideCard } from './shared/components/specialized/PublicReadingGuideCard'

export function PublicReadingGuidePage() {
  const query = useQuery({
    queryKey: ['reading-guides'],
    queryFn: listReadingGuides,
  })
  const guides = [...(query.data ?? [])].sort((a, b) => b.monthDate.localeCompare(a.monthDate))

  return (
    <div className="mx-auto w-full max-w-6xl px-1 pb-6 sm:px-8 sm:pb-5">
      <header>
        <h1 className="font-[Merriweather,Georgia,serif] text-2xl font-bold sm:text-3xl">
          Guías de lectura
        </h1>
        <p className="mt-2 text-muted-foreground">
          Consulta las guías disponibles para acompañar tu lectura.
        </p>
      </header>
      {query.isLoading && (
        <p className="mt-6" aria-live="polite">
          Cargando guías de lectura…
        </p>
      )}
      {query.isError && (
        <p className="mt-6 text-destructive" role="alert">
          No se pudieron cargar las guías de lectura.
        </p>
      )}
      {!query.isLoading && !query.isError && !guides.length && (
        <p className="mt-6 text-muted-foreground">No hay guías de lectura disponibles.</p>
      )}
      {!query.isLoading && !query.isError && guides.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <PublicReadingGuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}
    </div>
  )
}
