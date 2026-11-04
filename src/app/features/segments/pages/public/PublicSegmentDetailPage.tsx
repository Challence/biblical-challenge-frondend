import { useEffect, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent } from '@/app/shared/components/ui/card'
import { ShareButton } from '@/app/shared/components/share/ShareButton'
import { SegmentCover } from '../../shared/components/specialized/SegmentCover'
import { usePublicSegment } from '../../hooks/usePublicSegments'
import { SEGMENT_MONTHS } from '../../models/segmentCatalog'
import { useAnalytics } from '@/app/shared/analytics/useAnalytics'

export function PublicSegmentDetailPage() {
  const { slug } = useParams()
  const legacyId = slug && /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(slug) ? slug : undefined
  const navigate = useNavigate()
  const query = usePublicSegment(slug)
  const data = query.data
  const isLoading = query.isLoading
  const isError = query.isError
  const { track } = useAnalytics()
  const viewedSegmentId = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (legacyId && data) navigate(`/segmentos/${data.slug}`, { replace: true })
  }, [data, legacyId, navigate])
  useEffect(() => {
    if (data && viewedSegmentId.current !== data.id) {
      viewedSegmentId.current = data.id
      track({ type: 'segment_viewed', segmentId: data.id })
    }
  }, [data, track])
  if (isLoading) return <main className="p-6">Cargando segmento…</main>
  if (isError || !data)
    return (
      <main className="p-6" role="alert">
        Segmento no disponible.
      </main>
    )
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="flex items-center justify-between gap-4">
        <Link to="/guia" className="text-sm underline">
          ← Todos los segmentos
        </Link>
        <ShareButton
          content={{
            kind: 'segment',
            data,
            publicUrl: `${window.location.origin}/segmentos/${data.slug}`,
            entityId: data.id,
          }}
          accessibleLabel="Compartir segmento"
        />
      </div>
      <Card className="mt-4 overflow-hidden">
        <SegmentCover src={data.coverPath} alt={`Portada de ${data.title}`} />
        <CardContent className="p-5">
          <h1 className="font-heading text-3xl font-bold">{data.title}</h1>
          <p className="mt-2 text-muted-foreground">
            {SEGMENT_MONTHS[data.month - 1]} {data.year}
          </p>
          <h2 className="mt-8 text-xl font-semibold">Días de lectura</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.days.map((day) => (
              <Link
                key={day.id}
                to={`/segmentos/${data.slug}/dias/${day.day}`}
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
