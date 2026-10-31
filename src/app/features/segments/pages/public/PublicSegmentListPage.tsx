import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/app/shared/components/ui/card'
import { SegmentCover } from '../../shared/components/specialized/SegmentCover'
import { usePublicSegments } from '../../hooks/usePublicSegments'
import { SEGMENT_MONTHS } from '../../models/segmentCatalog'

export function PublicSegmentListPage() {
  const { data, isLoading, isError } = usePublicSegments()
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6" aria-labelledby="public-segments-title">
      <h1
        id="public-segments-title"
        className="font-[Merriweather,Georgia,serif] text-3xl font-bold"
      >
        Segmentos
      </h1>
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
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((segment) => (
          <Link
            key={segment.id}
            to={`/segmentos/${segment.id}`}
            className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="overflow-hidden">
              <SegmentCover src={segment.coverPath} alt={`Portada de ${segment.title}`} />
              <CardContent className="p-4">
                <h2 className="font-semibold">{segment.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {SEGMENT_MONTHS[segment.month - 1]} {segment.year} · {segment.days} días
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  )
}
