import { IconArrowRight, IconCheck, IconX } from '@tabler/icons-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/app/shared/components/ui/button'
import { Card } from '@/app/shared/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/shared/components/ui/dialog'
import { SEGMENT_COVER_KEY } from '@/app/features/segments/segmentStorage'
import guideCover from '@temp/image.png'

const readGuideCover = (from: string, to: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='${encodeURIComponent(from)}'/%3E%3Cstop offset='1' stop-color='${encodeURIComponent(to)}'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='640' height='360' fill='url(%23g)'/%3E%3Ccircle cx='520' cy='80' r='100' fill='%23ffffff' fill-opacity='.18'/%3E%3Cpath d='M0 290 Q180 210 360 300 T640 250 V360 H0Z' fill='%23ffffff' fill-opacity='.12'/%3E%3C/svg%3E`

const guides = [
  { title: 'Lecturas de febrero', dates: '1 de febrero — 28 de febrero', progress: 12, total: 28, cover: readGuideCover('#3d5975', '#9bc5c3') },
  { title: 'Lecturas de marzo', dates: '1 de marzo — 31 de marzo', progress: 4, total: 31, cover: readGuideCover('#7c4938', '#d69b67') },
  { title: 'Lecturas de primavera', dates: '1 de abril — 30 de abril', progress: 0, total: 30, cover: readGuideCover('#526b3d', '#c7c56e') },
]

export function GuidePage() {
  const navigate = useNavigate()
  const [selectedGuide, setSelectedGuide] = useState<(typeof guides)[number] | null>(null)
  const activeCover = typeof window !== 'undefined' ? window.localStorage.getItem(SEGMENT_COVER_KEY) || guideCover : guideCover
  const goToReading = () => navigate('/lectura-hoy')
  const openGuide = (guide: (typeof guides)[number]) => setSelectedGuide(guide)
  const selectDay = (day: number) => {
    setSelectedGuide(null)
    navigate('/lectura-hoy', { state: { day, guide: selectedGuide?.title } })
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-1 pb-6 sm:px-8 sm:pb-10" aria-labelledby="guide-title">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[var(--shape-20)] border border-border shadow-[var(--elevation-card)]">
        <div
          role="img"
          aria-label="Portada de la guía activa"
            className="relative h-[180px] bg-cover bg-center sm:h-[195px]"
          style={{ backgroundImage: `url(${activeCover})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" aria-hidden="true" />
            <div className="flex h-full items-center justify-between gap-4 p-4 text-white sm:p-6">
              <div className="min-w-0 max-w-2xl">
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] !text-white" style={{ color: '#fff' }}>Guía actual</p>
                <h1 id="guide-title" className="font-[Merriweather,Georgia,serif] text-2xl tracking-[-0.04em] !text-white sm:text-4xl" style={{ color: '#fff' }}>Lecturas de enero</h1>
                <p className="mt-1 text-sm !text-white" style={{ color: '#fff' }}>1 de enero — 31 de enero</p>
             </div>
             <Button onClick={goToReading} aria-label="Continuar lectura" className="size-11 shrink-0 rounded-full p-0 sm:size-12">
                 <IconArrowRight size={18} aria-hidden="true" />
               </Button>
           </div>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="other-guides-title">
        <h2 id="other-guides-title" className="font-[Merriweather,Georgia,serif] text-xl tracking-[-0.03em] sm:text-2xl">Guías de lectura</h2>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => {
            const percentage = Math.round((guide.progress / guide.total) * 100)
            return (
              <Card key={guide.title} className="group h-full overflow-hidden transition-shadow hover:shadow-[var(--elevation-card-hover)]">
                <button type="button" onClick={() => openGuide(guide)} className="flex min-h-24 w-full min-w-0 items-center gap-3 p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset sm:gap-4 sm:p-4" aria-label={`Ver días de ${guide.title}`}>
                  <img src={guide.cover} alt={`Portada de ${guide.title}`} className="size-16 shrink-0 rounded-[var(--shape-8)] object-cover transition-transform group-hover:scale-[1.03] sm:size-20" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-[Merriweather,Georgia,serif] text-base font-bold sm:text-lg">{guide.title}</h3>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground sm:text-sm">{guide.dates}</p>
                    <div className="mt-2 flex min-w-0 items-center justify-between gap-2 text-xs font-bold sm:text-sm"><span className="truncate">{guide.progress} de {guide.total} días</span><span className="shrink-0">{percentage}%</span></div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={`Progreso de ${guide.title}`} aria-valuemin={0} aria-valuemax={guide.total} aria-valuenow={guide.progress}><div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} /></div>
                  </div>
                  <IconArrowRight className="shrink-0 text-primary" size={20} aria-hidden="true" />
                </button>
              </Card>
            )
          })}
        </div>
      </section>

      <Dialog open={selectedGuide !== null} onOpenChange={(open) => !open && setSelectedGuide(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-t-[var(--shape-20)] p-5 sm:rounded-[var(--shape-20)] sm:p-6" aria-labelledby="guide-dialog-title">
          {selectedGuide && <>
            <DialogHeader className="pr-10">
              <DialogTitle id="guide-dialog-title" className="font-[Merriweather,Georgia,serif]">{selectedGuide.title}</DialogTitle>
              <DialogDescription>{selectedGuide.dates}</DialogDescription>
            </DialogHeader>
            <Button type="button" variant="ghost" size="icon" className="absolute right-3 top-3" onClick={() => setSelectedGuide(null)} aria-label="Cerrar selector de días">
              <IconX size={20} aria-hidden="true" />
            </Button>
            <div className="grid grid-cols-7 gap-2" aria-label={`Días de ${selectedGuide.title}`}>
              {Array.from({ length: selectedGuide.total }, (_, index) => {
                const day = index + 1
                const completed = day <= selectedGuide.progress
                const current = day === selectedGuide.progress + 1
                return <button key={day} type="button" data-autofocus={day === selectedGuide.progress + 1 ? true : undefined} onClick={() => selectDay(day)} className={`flex aspect-square min-h-11 flex-col items-center justify-center rounded-[var(--shape-8)] border text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${completed ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90' : current ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20' : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'}`} aria-label={`Día ${day}${completed ? ', completado' : current ? ', día actual' : ', pendiente'}`}>
                  {completed ? <IconCheck size={17} aria-hidden="true" /> : day}
                  {current && <span className="sr-only">Día actual</span>}
                </button>
              })}
            </div>
            <p className="text-xs text-muted-foreground">Selecciona un día para continuar con la lectura.</p>
          </>}
        </DialogContent>
      </Dialog>
    </main>
  )
}
