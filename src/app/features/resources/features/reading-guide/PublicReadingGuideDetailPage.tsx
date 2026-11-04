import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { PublicReadingGuideCard } from './shared/components/specialized/PublicReadingGuideCard'
import { getReadingGuide } from './services/readingGuideService'

export function PublicReadingGuideDetailPage() {
  const { guideId } = useParams<{ guideId: string }>()
  const query = useQuery({
    queryKey: ['reading-guides', guideId],
    queryFn: () => getReadingGuide(guideId as string),
    enabled: Boolean(guideId),
  })

  if (query.isLoading) return <p role="status">Cargando guía de lectura…</p>
  if (query.isError || !query.data) return <p role="alert">No se pudo cargar la guía de lectura.</p>
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <PublicReadingGuideCard guide={query.data} initialOpen />
    </main>
  )
}
