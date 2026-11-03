import { useState } from 'react'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { Button } from '@/app/shared/components/ui/button'
import { Empty } from '@/app/shared/components/empty/Empty'
import { usePublicSegmentDetails, usePublicSegments } from '../segments/hooks/usePublicSegments'
import { DEFAULT_SEGMENT_COVER } from '../segments/segmentStorage'
import { PublicSegmentDayTemplate } from '../segments/shared/components/specialized/PublicSegmentDayTemplate'
import { getCompletedDays, getProgressKey, saveCompletedDay } from './readingProgressStorage'
import type { getPublicSegment } from '../segments/services/segmentService'
type PublicSegment = Awaited<ReturnType<typeof getPublicSegment>>
type PublicDay = PublicSegment['days'][number]

export function ReadingTodayPage() {
  const today = new Date()
  const lists = usePublicSegments()
  const segments = lists.data ?? []
  const details = usePublicSegmentDetails(segments)
  const segment = segments.find(
    (item) => item.month === today.getMonth() + 1 && item.year === today.getFullYear(),
  )
  const detail = details.find((item) => item.data?.id === segment?.id)
  if (lists.isLoading || details.some((item) => item.isLoading))
    return <main className="p-6">Cargando lectura de hoy…</main>
  if (lists.isError || details.some((item) => item.isError))
    return (
      <main className="p-6" role="alert">
        No pudimos cargar la lectura de hoy. Intenta nuevamente más tarde.
      </main>
    )
  const dayNumber = today.getDate()
  const day = detail?.data?.days.find((item) => item.day === dayNumber)
  if (!segment || !detail?.data || !day) {
    const todayKey = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + dayNumber
    const candidates = details.flatMap((query) => {
      const data = query.data
      if (!data) return []
      return data.days.map((candidate) => ({
        segment: data,
        day: candidate,
        key: data.year * 10000 + data.month * 100 + candidate.day,
      }))
    })
    const previous = candidates
      .filter((item) => item.key < todayKey)
      .sort((a, b) => b.key - a.key)[0]
    const next = candidates.filter((item) => item.key > todayKey).sort((a, b) => a.key - b.key)[0]

    return <TodayEmptyState previous={previous} next={next} />
  }
  return <TodayContent segment={detail.data} day={day} />
}

function TodayEmptyState({
  previous,
  next,
}: {
  previous?: { segment: { id: string; month: number; year: number }; day: { day: number } }
  next?: { segment: { id: string; month: number; year: number }; day: { day: number } }
}) {
  const label = (item: NonNullable<typeof previous>) =>
    `${item.day.day}/${String(item.segment.month).padStart(2, '0')}/${item.segment.year}`
  return (
    <main className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center gap-6 p-6 text-center">
      <Empty size="lg" msg="No tenemos una lectura para hoy." />
      <div className="space-y-2">
        {(previous || next) && (
          <p className="text-muted-foreground">Puedes continuar con una lectura cercana.</p>
        )}
      </div>
      {(previous || next) && (
        <nav
          aria-label="Lecturas cercanas"
          className="flex w-full flex-col justify-center gap-4 sm:w-auto sm:flex-row"
        >
          {previous && (
            <Button asChild variant="outline" size="lg">
              <Link to={`/segmentos/${previous.segment.id}/dias/${previous.day.day}`}>
                <IconArrowLeft aria-hidden="true" />
                Lectura anterior: {label(previous)}
              </Link>
            </Button>
          )}
          {next && (
            <Button asChild size="lg">
              <Link to={`/segmentos/${next.segment.id}/dias/${next.day.day}`}>
                Lectura siguiente: {label(next)}
                <IconArrowRight aria-hidden="true" />
              </Link>
            </Button>
          )}
        </nav>
      )}
    </main>
  )
}

function TodayContent({ segment, day }: { segment: PublicSegment; day: PublicDay }) {
  const key = getProgressKey(segment.id)
  const [completed, setCompleted] = useState(() =>
    getCompletedDays(key, getCompletedDays(segment.title).includes(day.day) ? day.day : 0).includes(
      day.day,
    ),
  )
  return (
    <PublicSegmentDayTemplate
      segment={segment}
      day={day}
      cover={segment.coverPath || DEFAULT_SEGMENT_COVER}
      completed={completed}
      onComplete={() => {
        saveCompletedDay(key, day.day)
        saveCompletedDay(segment.title, day.day)
        setCompleted(true)
      }}
    />
  )
}
