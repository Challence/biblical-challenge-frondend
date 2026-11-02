import { usePublicSegments } from '../../../hooks/usePublicSegments'
import { PublicSegmentList } from './PublicSegmentList'

export function PublicSegmentSection() {
  const { data, isLoading, isError } = usePublicSegments()

  return (
    <section aria-labelledby="public-segments-title">
      <h2
        id="public-segments-title"
        className="font-[Merriweather,Georgia,serif] text-xl tracking-[-0.03em] sm:text-2xl"
      >
        Lectura por mes
      </h2>
      <p className="mt-2 text-muted-foreground">Explora las lecturas disponibles para cada mes.</p>
      {isLoading && (
        <p className="mt-6" aria-live="polite">
          Cargando lecturas…
        </p>
      )}
      {isError && (
        <p className="mt-6 text-destructive" role="alert">
          No se pudieron cargar las lecturas.
        </p>
      )}
      {!isLoading && !isError && !data?.length && (
        <p className="mt-6 text-muted-foreground">No hay lecturas publicadas.</p>
      )}
      {!isLoading && !isError && data?.length && <PublicSegmentList segments={data} />}
    </section>
  )
}
