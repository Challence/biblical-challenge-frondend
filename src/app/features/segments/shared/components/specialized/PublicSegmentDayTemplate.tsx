import { IconArrowLeft, IconArrowRight, IconCheck } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/shared/components/ui/button'
import { SegmentBlockRenderer } from './SegmentBlockRenderer'

type SegmentDay = {
  day: number
  blocks: Array<{
    id?: string
    type: 'text' | 'image' | 'video'
    content: string
    file_name?: string | null
  }>
}
type Segment = {
  id: string
  title: string
  month: number
  year: number
  coverPath?: string | null
  days: SegmentDay[]
}

type Props = {
  segment: Segment
  day: SegmentDay
  cover: string
  completed: boolean
  onComplete: () => void
  progressLabel?: string
}

export function PublicSegmentDayTemplate({
  segment,
  day,
  cover,
  completed,
  onComplete,
  progressLabel = 'Guía de lectura',
}: Props) {
  const navigate = useNavigate()
  const position = segment.days.findIndex((item) => item.day === day.day)
  const previous = segment.days[position - 1]
  const next = segment.days[position + 1]
  const month = new Intl.DateTimeFormat('es', { month: 'long' }).format(
    new Date(segment.year, segment.month - 1, 1),
  )

  return (
    <article
      className="mx-auto w-full max-w-5xl overflow-hidden rounded-[var(--shape-20)] border border-border bg-card shadow-[var(--elevation-card)]"
      aria-labelledby="reading-title"
    >
      <div
        className="relative h-[clamp(14rem,34vw,22rem)] bg-cover bg-center"
        style={{ backgroundImage: `url(${cover})` }}
        role="img"
        aria-label={`Portada de ${segment.title}`}
      >
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/35"
          aria-hidden="true"
        />
        <div className="relative flex items-start justify-between p-4 text-white sm:p-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full bg-black/25 text-white hover:bg-black/45 hover:text-white"
            aria-label="Volver"
          >
            <IconArrowLeft size={22} />
          </Button>
        </div>
      </div>
      <div className="relative -mt-12 mx-3 rounded-[var(--shape-16)] border border-border bg-card p-4 shadow-[var(--elevation-card)] sm:-mt-10 sm:mx-8 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {progressLabel}
        </p>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              id="reading-title"
              className="font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.04em]"
            >
              {segment.title}
            </h1>
            <p className="mt-1 text-sm capitalize text-muted-foreground">
              {month} {segment.year} · Día {day.day} de {segment.days.length}
            </p>
          </div>
        </div>
      </div>
      <section
        className="mx-3 mb-4 mt-3 rounded-[var(--shape-16)] border border-border bg-card p-4 sm:mx-8 sm:mb-8 sm:mt-5 sm:p-6"
        aria-labelledby="reading-section-title"
      >
        <h2 id="reading-section-title" className="font-heading text-2xl font-bold sm:text-3xl">
          Lectura
        </h2>
        <div className="mt-4 space-y-5 text-[0.98rem] leading-relaxed text-foreground/85">
          {day.blocks.map((block, index) => (
            <article key={block.id ?? `${block.type}-${index}`}>
              <SegmentBlockRenderer block={block} />
            </article>
          ))}
        </div>
        <Button
          type="button"
          onClick={onComplete}
          disabled={completed}
          aria-live="polite"
          className="mt-5 min-h-11 w-full gap-2 rounded-xl bg-secondary text-accent hover:bg-secondary/90 disabled:opacity-100"
        >
          <IconCheck
            size={20}
            className="rounded-full bg-accent p-0.5 text-secondary"
            aria-hidden="true"
          />
          {completed ? 'Lectura completada' : 'Marcar como completado'}
        </Button>
        <nav
          className="mt-5 flex justify-between gap-3 border-t border-border pt-4"
          aria-label="Navegación de lecturas"
        >
          {previous ? (
            <Button
              variant="outline"
              onClick={() => navigate(`/segmentos/${segment.id}/dias/${previous.day}`)}
            >
              <IconArrowLeft size={16} /> Día anterior
            </Button>
          ) : (
            <span />
          )}
          {next && (
            <Button
              variant="outline"
              onClick={() => navigate(`/segmentos/${segment.id}/dias/${next.day}`)}
            >
              Día siguiente <IconArrowRight size={16} />
            </Button>
          )}
        </nav>
      </section>
    </article>
  )
}
