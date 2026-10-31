import { Link, useParams } from 'react-router-dom'
import { Card, CardContent } from '@/app/shared/components/ui/card'
import { SegmentCover } from '../../shared/components/specialized/SegmentCover'
import { usePublicSegment } from '../../hooks/usePublicSegments'
import { SEGMENT_MONTHS } from '../../models/segmentCatalog'
export function PublicSegmentDetailPage() {
  const { id } = useParams()
  const { data, isLoading, isError } = usePublicSegment(id)
  if (isLoading) return <main className="p-6">Cargando segmento…</main>
  if (isError || !data)
    return (
      <main className="p-6" role="alert">
        Segmento no disponible.
      </main>
    )
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <Link to="/segmentos" className="text-sm underline">
        ← Todos los segmentos
      </Link>
      <Card className="mt-4 overflow-hidden">
        <SegmentCover src={data.coverPath} alt={`Portada de ${data.title}`} />
        <CardContent className="p-5">
          <h1 className="font-[Merriweather,Georgia,serif] text-3xl font-bold">{data.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {SEGMENT_MONTHS[data.month - 1]} {data.year}
          </p>
          <h2 className="mt-8 text-xl font-semibold">Días de lectura</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.days.map((day) => (
              <Link
                key={day.id}
                to={`/segmentos/${data.id}/dias/${day.day}`}
                className="rounded-md border p-4 text-center font-semibold hover:bg-muted"
              >
                Día {day.day}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
