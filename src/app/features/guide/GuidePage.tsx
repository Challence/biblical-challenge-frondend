import {
  IconArrowRight,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/shared/components/ui/button'
import { Card } from '@/app/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'
import guideCover from '@temp/image.png'
import { getCompletedDays } from '@/app/features/reading/readingProgressStorage'

const readGuideCover = (from: string, to: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='${encodeURIComponent(from)}'/%3E%3Cstop offset='1' stop-color='${encodeURIComponent(to)}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='360' fill='url(%23g)'/%3E%3Ccircle cx='520' cy='80' r='100' fill='%23ffffff' fill-opacity='.18'/%3E%3Cpath d='M0 290 Q180 210 360 300 T640 250 V360 H0Z' fill='%23ffffff' fill-opacity='.12'/%3E%3C/svg%3E`

const guides = [
  {
    title: 'Lecturas de febrero',
    dates: '1 de febrero — 28 de febrero',
    progress: 12,
    total: 28,
    cover: readGuideCover('#3d5975', '#9bc5c3'),
  },
  {
    title: 'Lecturas de marzo',
    dates: '1 de marzo — 31 de marzo',
    progress: 4,
    total: 31,
    cover: readGuideCover('#7c4938', '#d69b67'),
  },
  {
    title: 'Lecturas de primavera',
    dates: '1 de abril — 30 de abril',
    progress: 0,
    total: 30,
    cover: readGuideCover('#526b3d', '#c7c56e'),
  },
]

const carouselSlides = [
  {
    bg: guideCover,
    title: 'Lecturas de enero',
    description: 'Continúa tu lectura diaria y vuelve a donde lo dejaste.',
    href: '/lectura-hoy',
    label: 'Guía actual',
  },
  {
    bg: 'linear-gradient(120deg, #2f4858, #86bbbd)',
    title: 'Una pausa para leer',
    description: 'Encuentra un momento tranquilo para tu lectura de hoy.',
    href: '/lectura-hoy',
  },
  {
    bg: 'linear-gradient(120deg, #6c3f54, #d69b67)',
    title: 'Tu lectura, a tu ritmo',
    description: 'Cada día es una nueva oportunidad para volver al texto.',
    href: '/lectura-hoy',
  },
] as const

export function GuidePage() {
  const navigate = useNavigate()
  const [selectedGuide, setSelectedGuide] = useState<(typeof guides)[number] | null>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [carouselPaused, setCarouselPaused] = useState(false)
  const carouselGesture = useRef<{
    pointerId: number
    startX: number
    startY: number
    dragging: boolean
  } | null>(null)
  const suppressSlideClick = useRef(false)
  const [completedByGuide] = useState(() =>
    Object.fromEntries(
      guides.map((guide) => [guide.title, getCompletedDays(guide.title, guide.progress)]),
    ),
  )
  const openGuide = (guide: (typeof guides)[number]) => setSelectedGuide(guide)
  const selectDay = (day: number) => {
    setSelectedGuide(null)
    navigate('/lectura-hoy', { state: { day, guide: selectedGuide?.title } })
  }

  useEffect(() => {
    if (
      carouselPaused ||
      carouselSlides.length < 2 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return undefined
    const timer = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % carouselSlides.length),
      6000,
    )
    return () => window.clearInterval(timer)
  }, [carouselPaused])

  const slide = carouselSlides[activeSlide]
  const showSlide = (index: number) => {
    setActiveSlide(index)
    setCarouselPaused(true)
  }
  const moveSlide = (direction: -1 | 1) => {
    showSlide((activeSlide + direction + carouselSlides.length) % carouselSlides.length)
  }
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    carouselGesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    setCarouselPaused(true)
  }
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = carouselGesture.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    const deltaX = event.clientX - gesture.startX
    const deltaY = event.clientY - gesture.startY
    if (!gesture.dragging && Math.abs(deltaX) > 12 && Math.abs(deltaX) > Math.abs(deltaY))
      gesture.dragging = true
    if (gesture.dragging) event.preventDefault()
  }
  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    const gesture = carouselGesture.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    const deltaX = event.clientX - gesture.startX
    if (gesture.dragging && Math.abs(deltaX) >= 48) {
      setActiveSlide(
        (current) =>
          (current + (deltaX < 0 ? 1 : -1) + carouselSlides.length) % carouselSlides.length,
      )
      suppressSlideClick.current = true
    }
    carouselGesture.current = null
  }

  return (
    <main
      className="mx-auto w-full max-w-6xl px-1 pb-6 sm:px-8 sm:pb-5"
      aria-labelledby="guide-title"
    >
      <section
        className="mx-auto max-w-5xl overflow-hidden rounded-[var(--shape-20)] border border-border shadow-[var(--elevation-card)]"
        aria-roledescription="carrusel"
        aria-label="Anuncios y lecturas destacadas"
      >
        <div
          className="relative h-[210px] bg-cover bg-center sm:h-[230px]"
          onMouseEnter={() => setCarouselPaused(true)}
          onMouseLeave={() => setCarouselPaused(false)}
          onFocus={() => setCarouselPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setCarouselPaused(false)
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onClick={(event) => {
            if (suppressSlideClick.current) {
              event.preventDefault()
              suppressSlideClick.current = false
            }
          }}
          style={{
            backgroundImage: slide.bg.startsWith('linear-gradient') ? slide.bg : `url(${slide.bg})`,
            touchAction: 'pan-y',
          }}
        >
          <button
            type="button"
            onClick={() => moveSlide(-1)}
            className="absolute left-3 top-1/2 z-[1] hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4 sm:grid"
            aria-label="Anuncio anterior"
          >
            <IconChevronLeft size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => moveSlide(1)}
            className="absolute right-3 top-1/2 z-[1] hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4 sm:grid"
            aria-label="Siguiente anuncio"
          >
            <IconChevronRight size={20} aria-hidden="true" />
          </button>
          <a
            href={slide.href}
            aria-label={`Abrir: ${slide.title}`}
            className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <span className="sr-only">Abrir: {slide.title}</span>
          </a>
          <div className="pointer-events-none relative z-0 flex h-full items-center justify-between gap-4 p-4 text-white sm:p-6">
            <div className="min-w-0 max-w-2xl">
              <p
                className="mb-1 text-xs font-bold uppercase tracking-[0.14em] !text-white"
                style={{ color: '#fff' }}
              >
                {'label' in slide ? slide.label : 'Destacado'}
              </p>
              <h1
                id="guide-title"
                className="font-[Merriweather,Georgia,serif] text-2xl tracking-[-0.04em] !text-white sm:text-4xl"
                style={{ color: '#fff' }}
              >
                {slide.title}
              </h1>
              <p className="mt-1 max-w-lg text-sm !text-white" style={{ color: '#fff' }}>
                {slide.description}
              </p>
            </div>
          </div>
          <div
            className="absolute bottom-3 left-0 right-0 z-[1] flex justify-center gap-2"
            role="tablist"
            aria-label="Seleccionar anuncio"
          >
            {carouselSlides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-selected={index === activeSlide}
                aria-label={`Ir a ${item.title}`}
                onClick={() => showSlide(index)}
                className="min-h-11 min-w-11 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span
                  className={`block h-2 w-2 rounded-full ${index === activeSlide ? 'bg-white' : 'bg-white/50'}`}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6" aria-labelledby="other-guides-title">
        <h2
          id="other-guides-title"
          className="font-[Merriweather,Georgia,serif] text-xl tracking-[-0.03em] sm:text-2xl"
        >
          Guías de lectura
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => {
            const completedDays = completedByGuide[guide.title] ?? []
            const progress = completedDays.length
            const percentage = Math.round((progress / guide.total) * 100)
            return (
              <Card
                key={guide.title}
                className="group h-full overflow-hidden transition-shadow hover:shadow-[var(--elevation-card-hover)]"
              >
                <button
                  type="button"
                  onClick={() => openGuide(guide)}
                  className="flex min-h-24 w-full min-w-0 items-center gap-3 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset sm:gap-4 sm:p-4"
                  aria-label={`Ver días de ${guide.title}`}
                >
                  <img
                    src={guide.cover}
                    alt={`Portada de ${guide.title}`}
                    className="size-16 shrink-0 rounded-[var(--shape-8)] object-cover transition-transform group-hover:scale-[1.03] sm:size-20"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-[Merriweather,Georgia,serif] text-base font-bold sm:text-lg">
                      {guide.title}
                    </h3>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">
                      {guide.dates}
                    </p>
                    <div className="mt-2 flex min-w-0 items-center justify-between gap-2 text-xs font-bold sm:text-sm">
                      <span className="truncate">
                        {progress} de {guide.total} días
                      </span>
                      <span className="shrink-0">{percentage}%</span>
                    </div>
                    <div
                      className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-label={`Progreso de ${guide.title}`}
                      aria-valuemin={0}
                      aria-valuemax={guide.total}
                      aria-valuenow={progress}
                    >
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <IconArrowRight className="shrink-0 text-primary" size={20} aria-hidden="true" />
                </button>
              </Card>
            )
          })}
        </div>
      </section>

      <Dialog
        open={selectedGuide !== null}
        onOpenChange={(open) => !open && setSelectedGuide(null)}
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto rounded-t-[var(--shape-20)] p-5 sm:rounded-[var(--shape-20)] sm:p-6"
          aria-labelledby="guide-dialog-title"
        >
          {selectedGuide && (
            <>
              <DialogHeader className="pr-10">
                <DialogTitle id="guide-dialog-title" className="font-[Merriweather,Georgia,serif]">
                  {selectedGuide.title}
                </DialogTitle>
                <DialogDescription>{selectedGuide.dates}</DialogDescription>
              </DialogHeader>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3"
                onClick={() => setSelectedGuide(null)}
                aria-label="Cerrar selector de días"
              >
                <IconX size={20} aria-hidden="true" />
              </Button>
              <div className="grid grid-cols-7 gap-2" aria-label={`Días de ${selectedGuide.title}`}>
                {Array.from({ length: selectedGuide.total }, (_, index) => {
                  const day = index + 1
                  const completed = (completedByGuide[selectedGuide.title] ?? []).includes(day)
                  const current =
                    !completed && day === (completedByGuide[selectedGuide.title]?.length ?? 0) + 1
                  return (
                    <button
                      key={day}
                      type="button"
                      data-autofocus={day === selectedGuide.progress + 1 ? true : undefined}
                      onClick={() => selectDay(day)}
                      className={`flex aspect-square min-h-11 flex-col items-center justify-center rounded-[var(--shape-8)] border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${completed ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90' : current ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20' : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'}`}
                      aria-label={`Día ${day}${completed ? ', completado' : current ? ', día actual' : ', pendiente'}`}
                    >
                      {completed ? <IconCheck size={17} aria-hidden="true" /> : day}
                      {current && <span className="sr-only">Día actual</span>}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Selecciona un día para continuar con la lectura.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
