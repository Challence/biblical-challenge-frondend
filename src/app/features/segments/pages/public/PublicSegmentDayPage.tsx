import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { usePublicSegment } from '../../hooks/usePublicSegments'
import { DEFAULT_SEGMENT_COVER } from '../../segmentStorage'
import {
  getCompletedDays,
  getProgressKey,
  saveCompletedDay,
} from '../../../reading/readingProgressStorage'
import { PublicSegmentDayTemplate } from '../../shared/components/specialized/PublicSegmentDayTemplate'
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
  return <PublicSegmentDayContent data={data} day={day} />
}

function PublicSegmentDayContent({
  data,
  day,
}: {
  data: NonNullable<ReturnType<typeof usePublicSegment>['data']>
  day: NonNullable<NonNullable<ReturnType<typeof usePublicSegment>['data']>['days'][number]>
}) {
  const key = getProgressKey(data.id, data.title)
  const [marked, setMarked] = useState(false)
  const completed =
    marked ||
    getCompletedDays(key, getCompletedDays(data.title).includes(day.day) ? day.day : 0).includes(
      day.day,
    )
  return (
    <PublicSegmentDayTemplate
      segment={data}
      day={day}
      cover={data.coverPath || DEFAULT_SEGMENT_COVER}
      completed={completed}
      onComplete={() => {
        saveCompletedDay(key, day.day)
        saveCompletedDay(data.title, day.day)
        setMarked(true)
      }}
    />
  )
}
