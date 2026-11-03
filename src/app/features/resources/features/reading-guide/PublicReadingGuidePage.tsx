import { IconBook } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { Empty } from '@/app/shared/components/empty/Empty'
import { listReadingGuides } from './services/readingGuideService'
import { PublicReadingGuideCard } from './shared/components/specialized/PublicReadingGuideCard'

export function PublicReadingGuidePage() {
  const query = useQuery({
    queryKey: ['reading-guides'],
    queryFn: listReadingGuides,
  })
  const guides = [...(query.data ?? [])].sort((a, b) => b.monthDate.localeCompare(a.monthDate))
  const isEmpty = !query.isLoading && !query.isError && guides.length === 0

  return (
    <div
      className={`mx-auto w-full max-w-6xl px-1 pb-6 sm:px-8 sm:pb-5${
        isEmpty ? ' flex min-h-full items-center justify-center' : ''
      }`}
    >
      {query.isLoading || query.isError || guides.length > 0 ? (
        <header>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold text-primary sm:text-3xl">
            <IconBook className="size-7 shrink-0 sm:size-8" aria-hidden="true" />
            <span>Guías de lectura</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Consulta las guías disponibles para acompañar tu lectura.
          </p>
        </header>
      ) : null}
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
      {isEmpty && <Empty size="lg" msg="No hay guías de lecturas agregadas" />}
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
