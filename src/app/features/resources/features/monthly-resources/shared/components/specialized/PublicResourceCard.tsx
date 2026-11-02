import { useState } from 'react'
import { IconExternalLink, IconPlayerPlay, IconX } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/shared/components/ui/card'
import { Dialog, DialogContent, DialogTitle } from '@/app/shared/components/ui/dialog'
import type { MonthlyResource } from '../../../models/resource'
import { getPublicVideoSource } from '../../../utils/publicVideoSource'

export function PublicResourceCard({ resource }: { resource: MonthlyResource }) {
  const [open, setOpen] = useState(false)
  const videoSource =
    resource.type === 'video' && resource.videoUrl
      ? getPublicVideoSource(resource.videoUrl)
      : undefined

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-[var(--shape-16)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={`Ver ${resource.title} en pantalla completa`}
      >
        <Card className="h-full overflow-hidden transition-shadow hover:shadow-[var(--elevation-card-hover)]">
          <div className="aspect-video bg-slate-900">
            {resource.type === 'image' && resource.imageUrl ? (
              <img
                src={resource.imageUrl}
                alt={resource.title}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-white">
                <IconPlayerPlay aria-hidden="true" size={42} />
              </div>
            )}
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{resource.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{resource.description}</p>
          </CardContent>
        </Card>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent variant="fullscreen" aria-labelledby={`resource-preview-${resource.id}`}>
          <DialogTitle id={`resource-preview-${resource.id}`} className="sr-only">
            {resource.title}
          </DialogTitle>
          {resource.type === 'image' && resource.imageUrl ? (
            <img
              src={resource.imageUrl}
              alt={`${resource.title} en pantalla completa`}
              className="size-full object-contain"
            />
          ) : videoSource?.type === 'embed' ? (
            <iframe
              src={videoSource.url}
              title={resource.title}
              className="size-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : videoSource?.type === 'native' ? (
            <video src={videoSource.url} controls autoPlay className="size-full object-contain">
              Tu navegador no puede reproducir este video.
            </video>
          ) : videoSource ? (
            <div className="flex size-full items-center justify-center p-6">
              <a
                href={videoSource.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <IconExternalLink size={20} aria-hidden="true" />
                Abrir video
              </a>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-[max(1rem,env(safe-area-inset-right))] top-[max(1rem,env(safe-area-inset-top))] flex size-11 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            aria-label="Cerrar recurso"
            data-autofocus
          >
            <IconX size={24} aria-hidden="true" />
          </button>
        </DialogContent>
      </Dialog>
    </>
  )
}
