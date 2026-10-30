import { useState } from 'react'
import {
  IconArrowLeft,
  IconCheck,
  IconDots,
  IconPlayerPlay,
  IconShare,
  IconX,
} from '@tabler/icons-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/app/shared/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/app/shared/components/ui/dialog'
import {
  DEFAULT_SEGMENT_COVER,
  getActiveSegmentCover,
} from '@/app/features/segments/segmentStorage'
import { getCompletedDays, saveCompletedDay } from './readingProgressStorage'

export function ReadingTodayPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const readingState = location.state as { day?: number; guide?: string } | null
  const selectedDay = readingState?.day ?? 6
  const guide = readingState?.guide ?? 'Lecturas de febrero'
  const [completed, setCompleted] = useState(() => getCompletedDays(guide).includes(selectedDay))
  const [videoOpen, setVideoOpen] = useState(false)
  const cover = getActiveSegmentCover() || DEFAULT_SEGMENT_COVER

  return (
    <>
      <article
        className="mx-auto w-full max-w-5xl overflow-hidden rounded-[var(--shape-20)] border border-border bg-card shadow-[var(--elevation-card)]"
        aria-labelledby="reading-title"
      >
        <div
          className="relative h-[clamp(14rem,34vw,22rem)] bg-cover bg-center"
          style={{ backgroundImage: `url(${cover})` }}
          role="img"
          aria-label="Portada de la lectura de hoy"
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
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/25 text-white hover:bg-black/45 hover:text-white"
                aria-label="Compartir"
              >
                <IconShare size={21} />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full bg-black/25 text-white hover:bg-black/45 hover:text-white"
                aria-label="Más opciones"
              >
                <IconDots size={21} />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative -mt-12 mx-3 rounded-[var(--shape-16)] border border-border bg-card p-4 shadow-[var(--elevation-card)] sm:-mt-10 sm:mx-8 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Guía de lectura
          </p>
          <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1
                id="reading-title"
                className="font-[Merriweather,Georgia,serif] text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.04em]"
              >
                Caminando en fe
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">Mayo 9 · Día {selectedDay} de 17</p>
            </div>
            <Button
              type="button"
              onClick={() => setVideoOpen(true)}
              aria-expanded={videoOpen}
              className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"
            >
              <IconPlayerPlay size={18} fill="currentColor" aria-hidden="true" />
              Ver video
            </Button>
          </div>
        </div>

        <section
          className="mx-3 mb-4 mt-3 rounded-[var(--shape-16)] border border-border bg-card p-4 sm:mx-8 sm:mb-8 sm:mt-5 sm:p-6"
          aria-labelledby="reading-section-title"
        >
          <h2
            id="reading-section-title"
            className="font-[Merriweather,Georgia,serif] text-2xl font-bold sm:text-3xl"
          >
            Lectura
          </h2>
          <blockquote className="mt-4 border-b border-border pb-4 font-[Merriweather,Georgia,serif] text-lg leading-relaxed sm:text-xl">
            «Porque por gracia ustedes han sido salvos mediante la fe, y esto no procede de ustedes,
            sino que es el regalo de Dios; no por obras, para que nadie se jacte».
            <footer className="mt-2 font-sans text-sm text-muted-foreground">
              Efesios 2:8–9 (NVI)
            </footer>
          </blockquote>
          <div className="mt-4 space-y-3 text-[0.98rem] leading-relaxed text-foreground/85">
            <p>
              La fe nos invita a caminar cada día confiando en que Dios tiene un plan mejor, aun
              cuando no podemos ver todo el camino. No se trata de tener todas las respuestas, sino
              de dar el siguiente paso con la seguridad de que Él va con nosotros.
            </p>
            <p>
              Hoy podemos elegir caminar en fe. La fe transforma nuestra manera de ver las pruebas,
              porque nos recuerda que Dios sigue obrando, incluso cuando todo parece incierto.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => {
              saveCompletedDay(guide, selectedDay)
              setCompleted(true)
            }}
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
        </section>
      </article>
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent
          variant="fullscreen"
          aria-labelledby="reading-video-title"
          className="relative z-10 flex pointer-events-auto flex-col items-center justify-center gap-4"
        >
          <div className="flex w-full items-center justify-between text-white">
            <DialogTitle id="reading-video-title" className="text-lg text-white">
              Video de la lectura
            </DialogTitle>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              data-autofocus
              onClick={() => setVideoOpen(false)}
              aria-label="Cerrar video"
              className="text-white hover:bg-white/15 hover:text-white"
            >
              <IconX size={22} aria-hidden="true" />
            </Button>
          </div>
          <div className="relative z-10 aspect-video max-h-[calc(100dvh-8rem)] w-full max-w-5xl overflow-hidden rounded-[var(--shape-12)] bg-black pointer-events-auto">
            {videoOpen && (
              <iframe
                className="relative z-10 h-full w-full pointer-events-auto"
                src={`https://www.youtube.com/embed/MC8BqGu9B8A?playsinline=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`}
                title="Caminando en fe — video de la lectura"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
          </div>
          <a
            href="https://www.youtube.com/watch?v=MC8BqGu9B8A"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white underline underline-offset-4"
          >
            Ver en YouTube
          </a>
        </DialogContent>
      </Dialog>
    </>
  )
}
