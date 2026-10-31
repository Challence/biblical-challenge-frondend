import { usePublicSegments } from '../../hooks/usePublicSegments'
import { PublicSegmentList } from '../../shared/components/specialized/PublicSegmentList'

export function PublicSegmentListPage() {
  const { data, isLoading, isError } = usePublicSegments()
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6" aria-labelledby="public-segments-title">
      <h2
        id="other-guides-title"
        className="font-[Merriweather,Georgia,serif] text-xl tracking-[-0.03em] sm:text-2xl"
      >
        Guías de lectura
      </h2>
      <p className="mt-2 text-muted-foreground">Explora nuestras guías de lectura.</p>
      {isLoading && (
        <p className="mt-6" aria-live="polite">
          Cargando segmentos…
        </p>
      )}
      {isError && (
        <p className="mt-6 text-destructive" role="alert">
          No se pudieron cargar los segmentos.
        </p>
      )}
      {!isLoading && !isError && !data?.length && (
        <p className="mt-6 text-muted-foreground">No hay segmentos publicados.</p>
      )}
      {!isLoading && !isError && data?.length && <PublicSegmentList segments={data} />}
    </main>
  )
}
