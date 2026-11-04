import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import * as service from '../services/announcementService'
import { useAnalytics } from '@/app/shared/analytics/useAnalytics'

export function PublicAnnouncementCarousel() {
  const navigate = useNavigate()
  const { track } = useAnalytics()
  const query = useQuery({
    queryKey: ['public-announcements'],
    queryFn: service.listPublicAnnouncements,
  })
  const slides = (query.data ?? []).map((item) => ({
    ...item,
    desktopImage: service.resolveAnnouncementImageUrl(item.imageDesktopPath ?? item.imagePath),
    tabletImage: service.resolveAnnouncementImageUrl(item.imageTabletPath ?? item.imagePath),
    mobileImage: service.resolveAnnouncementImageUrl(item.imageMobilePath ?? item.imagePath),
  }))
  const [activeSlide, setActiveSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const gesture = useRef<{
    pointerId: number
    startX: number
    startY: number
    dragging: boolean
  } | null>(null)
  const suppressClick = useRef(false)
  useEffect(() => {
    if (
      paused ||
      slides.length < 2 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return undefined
    const timer = window.setInterval(
      () => setActiveSlide((current) => (current + 1) % slides.length),
      6000,
    )
    return () => window.clearInterval(timer)
  }, [paused, slides.length])
  if (query.isLoading || query.isError || !query.data?.length) return null

  const show = (index: number) => {
    setActiveSlide(index)
    setPaused(true)
  }
  const move = (direction: -1 | 1) =>
    show((activeSlide + direction + slides.length) % slides.length)
  const currentSlide = Math.min(activeSlide, slides.length - 1)
  const slide = slides[currentSlide]
  const isExternal = Boolean(slide.href && /^https:\/\//i.test(slide.href))
  const openSlide = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (suppressClick.current) {
      event.preventDefault()
      suppressClick.current = false
      return
    }
    try {
      track({ type: 'announcement_clicked', announcementId: slide.id })
    } catch {
      // Analytics must never prevent the announcement from opening.
    }
    if (isExternal || !slide.href) return
    event.preventDefault()
    navigate(slide.href)
  }
  const end = (event: React.PointerEvent<HTMLDivElement>) => {
    const current = gesture.current
    if (!current || current.pointerId !== event.pointerId) return
    const delta = event.clientX - current.startX
    if (current.dragging && Math.abs(delta) >= 48) {
      setActiveSlide((index) => (index + (delta < 0 ? 1 : -1) + slides.length) % slides.length)
      suppressClick.current = true
    }
    gesture.current = null
  }
  const hasDesktopImage = Boolean(slide.desktopImage)
  return (
    <section
      className="mx-auto max-w-5xl overflow-hidden rounded-[var(--shape-20)] border border-border shadow-[var(--elevation-card)]"
      aria-roledescription="carrusel"
      aria-label="Anuncios y lecturas destacadas"
    >
      <div
        className="relative aspect-[4/1] bg-muted"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false)
        }}
        onPointerDown={(event) => {
          gesture.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            dragging: false,
          }
          setPaused(true)
        }}
        onPointerMove={(event) => {
          const current = gesture.current
          if (!current || current.pointerId !== event.pointerId) return
          const x = event.clientX - current.startX
          const y = event.clientY - current.startY
          if (!current.dragging && Math.abs(x) > 12 && Math.abs(x) > Math.abs(y)) {
            current.dragging = true
            event.currentTarget.setPointerCapture(event.pointerId)
          }
          if (current.dragging) event.preventDefault()
        }}
        onPointerUp={end}
        onPointerCancel={end}
        onClick={(event) => {
          if (suppressClick.current) {
            event.preventDefault()
            suppressClick.current = false
          }
        }}
        style={{ touchAction: 'pan-y' }}
      >
        {hasDesktopImage && (
          <picture className="absolute inset-0">
            {slide.mobileImage && <source media="(max-width: 639px)" srcSet={slide.mobileImage} />}
            {slide.tabletImage && <source media="(max-width: 1023px)" srcSet={slide.tabletImage} />}
            <img src={slide.desktopImage} alt="" className="size-full object-contain" />
          </picture>
        )}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              className="absolute left-3 top-1/2 z-[1] hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-4 sm:grid"
              aria-label="Anuncio anterior"
            >
              <IconChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              className="absolute right-3 top-1/2 z-[1] hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4 sm:grid"
              aria-label="Siguiente anuncio"
            >
              <IconChevronRight size={20} aria-hidden="true" />
            </button>
          </>
        )}
        <a
          href={isExternal ? (slide.href ?? undefined) : undefined}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          onClick={openSlide}
          aria-label="Abrir anuncio"
          className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <span className="sr-only">Abrir anuncio</span>
        </a>
        {slides.length > 1 && (
          <div
            className="absolute bottom-3 left-0 right-0 z-[1] flex justify-center gap-2"
            role="tablist"
            aria-label="Seleccionar anuncio"
          >
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === currentSlide}
                aria-label={`Ir al anuncio ${index + 1}`}
                onClick={() => show(index)}
                className="min-h-11 min-w-11 p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span
                  className={`block h-2 w-2 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
