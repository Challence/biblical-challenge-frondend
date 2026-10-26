import { useState } from 'react'
import { IconArrowLeft, IconCheck, IconDots, IconPlayerPlay, IconShare, IconX } from '@tabler/icons-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/app/shared/components/ui/button'
import { Card } from '@/app/shared/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/shared/components/ui/dialog'
import { DEFAULT_SEGMENT_COVER, getActiveSegmentCover } from '@/app/features/segments/segmentStorage'

export function ReadingTodayPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const selectedDay = (location.state as { day?: number } | null)?.day ?? 6
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const cover = getActiveSegmentCover() || DEFAULT_SEGMENT_COVER

  return (
    <>
      <article className="mx-auto w-full max-w-5xl overflow-hidden rounded-[var(--shape-20)] border border-border bg-card shadow-[var(--elevation-card)]" aria-labelledby="reading-title">
        <div className="relative h-[clamp(14rem,34vw,22rem)] bg-cover bg-center" style={{ backgroundImage: `url(${cover})` }} role="img" aria-label="Portada de la lectura de hoy">
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/35" aria-hidden="true" />
          <div className="relative flex items-start justify-between p-4 text-white sm:p-6">
            <Button type="button" variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-black/25 text-white hover:bg-black/45 hover:text-white" aria-label="Volver"><IconArrowLeft size={22} /></Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="icon" className="rounded-full bg-black/25 text-white hover:bg-black/45 hover:text-white" aria-label="Compartir"><IconShare size={21} /></Button>
              <Button type="button" variant="ghost" size="icon" className="rounded-full bg-black/25 text-white hover:bg-black/45 hover:text-white" aria-label="Más opciones"><IconDots size={21} /></Button>
            </div>
          </div>
        </div>

        <div className="relative -mt-12 mx-3 rounded-[var(--shape-16)] border border-border bg-card p-4 shadow-[var(--elevation-card)] sm:-mt-10 sm:mx-8 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Guía de lectura</p>
          <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><h1 id="reading-title" className="font-[Merriweather,Georgia,serif] text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight tracking-[-0.04em]">Caminando en fe</h1><p className="mt-1 text-sm text-muted-foreground">Mayo 9 · Día {selectedDay} de 17</p></div>
            <Button type="button" onClick={() => setVideoOpen((open) => !open)} aria-expanded={videoOpen} className="w-full gap-2 bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"><IconPlayerPlay size={18} fill="currentColor" aria-hidden="true" />{videoOpen ? 'Ocultar video' : 'Ver video'}</Button>
          </div>
        </div>

        <section className="mx-3 mb-4 mt-3 rounded-[var(--shape-16)] border border-border bg-card p-4 sm:mx-8 sm:mb-8 sm:mt-5 sm:p-6" aria-labelledby="reading-section-title">
          <h2 id="reading-section-title" className="font-[Merriweather,Georgia,serif] text-2xl font-bold sm:text-3xl">Lectura</h2>
          <blockquote className="mt-4 border-b border-border pb-4 font-[Merriweather,Georgia,serif] text-lg leading-relaxed sm:text-xl">«Porque por gracia ustedes han sido salvos mediante la fe, y esto no procede de ustedes, sino que es el regalo de Dios; no por obras, para que nadie se jacte».<footer className="mt-2 font-sans text-sm text-muted-foreground">Efesios 2:8–9 (NVI)</footer></blockquote>
          <div className="mt-4 space-y-3 text-[0.98rem] leading-relaxed text-foreground/85"><p>La fe nos invita a caminar cada día confiando en que Dios tiene un plan mejor, aun cuando no podemos ver todo el camino. No se trata de tener todas las respuestas, sino de dar el siguiente paso con la seguridad de que Él va con nosotros.</p><p>Hoy podemos elegir caminar en fe. La fe transforma nuestra manera de ver las pruebas, porque nos recuerda que Dios sigue obrando, incluso cuando todo parece incierto.</p></div>
          <Button type="button" onClick={() => setAuthDialogOpen(true)} className="mt-5 min-h-11 w-full gap-2 rounded-xl bg-secondary text-accent hover:bg-secondary/90"><IconCheck size={20} className="rounded-full bg-accent p-0.5 text-secondary" aria-hidden="true" />Marcar como completado</Button>
        </section>
      </article>
      {videoOpen && <Card className="mx-auto mt-4 w-full max-w-5xl p-3 sm:p-5" aria-label="Video de la lectura"><div className="mb-3 flex items-center justify-between"><h2 className="font-[Merriweather,Georgia,serif] text-lg font-bold">Video de la lectura</h2><Button type="button" variant="ghost" size="icon" onClick={() => setVideoOpen(false)} aria-label="Cerrar video"><IconX size={20} aria-hidden="true" /></Button></div><div className="aspect-video overflow-hidden rounded-[var(--shape-12)] bg-black"><iframe className="h-full w-full" src="https://www.youtube.com/embed/MC8BqGu9B8A" title="Caminando en fe — video de la lectura" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" /></div></Card>}

      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}><DialogContent aria-labelledby="auth-title" aria-describedby="auth-description"><DialogHeader><DialogTitle id="auth-title">Inicia sesión para guardar tu progreso</DialogTitle><DialogDescription id="auth-description">La lectura está disponible sin autenticación. Para marcarla como completada necesitas iniciar sesión o crear una cuenta.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setAuthDialogOpen(false)}>Ahora no</Button><Button type="button" onClick={() => setAuthDialogOpen(false)}>Entendido</Button></div></DialogContent></Dialog>
    </>
  )
}
