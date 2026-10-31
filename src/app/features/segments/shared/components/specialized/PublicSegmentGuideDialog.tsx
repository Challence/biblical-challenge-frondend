import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePublicSegment } from '../../../hooks/usePublicSegments'
import { SEGMENT_MONTHS, SEGMENT_WEEKDAYS } from '../../../models/segmentCatalog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'

export function PublicSegmentGuideDialog({
  segmentId,
  children,
}: {
  segmentId: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const { data, isLoading, isError } = usePublicSegment(open ? segmentId : undefined)
  return (
    <>
      <span onClick={() => setOpen(true)} className="contents">
        {children}
      </span>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          aria-labelledby="public-guide-title"
          aria-describedby="public-guide-description"
        >
          <DialogHeader>
            <DialogTitle id="public-guide-title">{data?.title ?? 'Guía del segmento'}</DialogTitle>
            <DialogDescription id="public-guide-description">
              Selecciona un día para abrir su contenido.
            </DialogDescription>
          </DialogHeader>
          {isLoading && <p role="status">Cargando calendario…</p>}
          {isError && (
            <p role="alert" className="text-destructive">
              No se pudo cargar la guía.
            </p>
          )}
          {data && !isLoading && !isError && (
            <PublicSegmentCalendar segment={data} onClose={() => setOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

type CalendarSegment = {
  id: string
  title: string
  month: number
  year: number
  days: { day: number }[]
}
export function PublicSegmentCalendar({
  segment,
  onClose,
}: {
  segment: CalendarSegment
  onClose: () => void
}) {
  const navigate = useNavigate()
  const firstDay = new Date(segment.year, segment.month - 1, 1).getDay()
  const offset = (firstDay + 6) % 7
  const monthDays = new Date(segment.year, segment.month, 0).getDate()
  const defined = new Set(segment.days.map((item) => item.day))
  if (!segment.days.length) return <p>No hay días definidos para este segmento.</p>
  return (
    <div
      className="grid grid-cols-7 gap-px text-center"
      role="grid"
      aria-label={`Calendario de ${SEGMENT_MONTHS[segment.month - 1]} ${segment.year}`}
    >
      <div className="col-span-7 mb-2 text-base font-semibold">
        {SEGMENT_MONTHS[segment.month - 1]} {segment.year}
      </div>
      {SEGMENT_WEEKDAYS.map((day) => (
        <span key={day} className="py-1 text-xs font-bold text-muted-foreground">
          {day}
        </span>
      ))}
      {Array.from({ length: offset }, (_, index) => (
        <span key={`empty-${index}`} />
      ))}
      {Array.from({ length: monthDays }, (_, index) => {
        const day = index + 1
        const active = defined.has(day)
        return (
          <button
            key={day}
            type="button"
            disabled={!active}
            aria-label={`Día ${day}${active ? ', configurado' : ', no disponible'}`}
            className={`h-10 w-10 justify-self-center rounded-md border text-sm ${active ? 'border-primary bg-primary text-primary-foreground hover:opacity-90' : 'cursor-not-allowed border-transparent text-muted-foreground opacity-50'}`}
            onClick={() => {
              if (active) {
                navigate(`/segmentos/${segment.id}/dias/${day}`)
                onClose()
              }
            }}
          >
            {day}
          </button>
        )
      })}
    </div>
  )
}
