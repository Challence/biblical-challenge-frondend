import { useState } from 'react'
import { IconX } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/app/shared/components/ui/card'
import { ShareButton } from '@/app/shared/components/share/ShareButton'
import { Dialog, DialogContent, DialogTitle } from '@/app/shared/components/ui/dialog'
import type { ReadingGuide } from '../../../models/readingGuide'

const formatPeriod = (period: string) => {
  const [year, month] = period.split('-').map(Number)
  const label = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1),
  )
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function PublicReadingGuideCard({
  guide,
  initialOpen = false,
}: {
  guide: ReadingGuide
  initialOpen?: boolean
}) {
  const period = formatPeriod(guide.monthDate)
  const [open, setOpen] = useState(initialOpen)
  const url = `${window.location.origin}/guia/${guide.id}`

  return (
    <>
      <div className="relative">
        <Link
          to={`/guia/${guide.id}`}
          className="block rounded-[var(--shape-16)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label={`Ver guía de lectura de ${period} en pantalla completa`}
        >
          <Card className="overflow-hidden transition-shadow hover:shadow-[var(--elevation-card-hover)]">
            <img
              src={guide.imageUrl}
              alt={`Guía de lectura de ${period}`}
              className="h-48 w-full bg-muted object-contain sm:h-56"
            />
            <CardContent className="p-4">
              <h2 className="font-heading text-base font-bold sm:text-lg">{period}</h2>
            </CardContent>
          </Card>
        </Link>
        <div className="absolute right-3 top-3">
          <ShareButton
            content={{
              kind: 'readingGuide',
              data: {
                name: `Guía de lectura de ${period}`,
                description: `Consulta la guía de lectura de ${period}.`,
              },
              publicUrl: url,
              files: [guide.imageUrl],
              entityId: guide.id,
            }}
          />
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent variant="fullscreen" aria-labelledby={`guide-preview-${guide.id}`}>
          <DialogTitle id={`guide-preview-${guide.id}`} className="sr-only">
            Guía de lectura de {period}
          </DialogTitle>
          <img
            src={guide.imageUrl}
            alt={`Guía de lectura de ${period} en pantalla completa`}
            className="size-full object-contain"
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] flex size-11 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label="Cerrar guía de lectura"
            data-autofocus
          >
            <IconX size={24} aria-hidden="true" />
          </button>
        </DialogContent>
      </Dialog>
    </>
  )
}
