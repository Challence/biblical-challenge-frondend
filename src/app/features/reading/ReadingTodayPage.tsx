import { useState } from 'react'
import { usePublicSegment, usePublicSegments } from '../segments/hooks/usePublicSegments'
import { DEFAULT_SEGMENT_COVER } from '../segments/segmentStorage'
import { PublicSegmentDayTemplate } from '../segments/shared/components/specialized/PublicSegmentDayTemplate'
import { getCompletedDays, getProgressKey, saveCompletedDay } from './readingProgressStorage'

export function ReadingTodayPage() {
  const today = new Date()
  const lists = usePublicSegments()
  const segment = lists.data?.find(
    (item) => item.month === today.getMonth() + 1 && item.year === today.getFullYear(),
  )
  const detail = usePublicSegment(segment?.id)
  if (lists.isLoading || (segment && detail.isLoading))
    return <main className="p-6">Cargando lectura de hoy…</main>
  if (lists.isError || detail.isError || !segment)
    return (
      <main className="p-6" role="alert">
        No hay una lectura activa disponible para hoy.
      </main>
    )
  const dayNumber = today.getDate()
  const day = detail.data?.days.find((item) => item.day === dayNumber)
  if (!detail.data || !day)
    return (
      <main className="p-6" role="alert">
        La lectura de hoy no está disponible.
      </main>
    )
  return <TodayContent segment={detail.data} day={day} />
}

function TodayContent({
  segment,
  day,
}: {
  segment: NonNullable<ReturnType<typeof usePublicSegment>['data']>
  day: NonNullable<NonNullable<ReturnType<typeof usePublicSegment>['data']>['days'][number]>
}) {
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
