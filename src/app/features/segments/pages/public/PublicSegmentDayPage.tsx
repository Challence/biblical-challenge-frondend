import { Link, useParams } from 'react-router-dom'
import { usePublicSegment } from '../../hooks/usePublicSegments'
import { SegmentBlockRenderer } from '../../shared/components/specialized/SegmentBlockRenderer'
export function PublicSegmentDayPage() {
  const { id, day: dayParam } = useParams()
  const { data, isLoading, isError } = usePublicSegment(id)
  if (isLoading) return <main className="p-6">Cargando lectura…</main>
  const day = data?.days.find((item) => item.day === Number(dayParam))
  if (isError || !data || !day)
    return (
      <main className="p-6" role="alert">
        Lectura no disponible.
      </main>
    )
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <Link to="/guia" className="text-sm underline">
        ← Volver al segmento
      </Link>
      <h1 className="mt-4 font-[Merriweather,Georgia,serif] text-3xl font-bold">
        {data.title} · Día {day.day}
      </h1>
      <section className="mt-6 space-y-5">
        {day.blocks.map((block) => (
          <article key={block.id}>
            <SegmentBlockRenderer block={block} />
          </article>
        ))}
      </section>
    </main>
  )
}
