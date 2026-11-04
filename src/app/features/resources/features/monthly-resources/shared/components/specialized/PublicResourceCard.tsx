import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IconExternalLink, IconPlayerPlay, IconX } from '@tabler/icons-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/shared/components/ui/card'
import { Dialog, DialogContent, DialogTitle } from '@/app/shared/components/ui/dialog'
import type { MonthlyResource } from '../../../models/resource'
import { getPublicVideoSource } from '../../../utils/publicVideoSource'
import { useAnalytics } from '@/app/shared/analytics/useAnalytics'
import { ShareButton } from '@/app/shared/components/share/ShareButton'

export function PublicResourceCard({
  resource,
  monthDate,
  autoOpen = false,
}: {
  resource: MonthlyResource
  monthDate?: string
  autoOpen?: boolean
}) {
  const [open, setOpen] = useState(autoOpen)
  const embedFrameRef = useRef<HTMLIFrameElement>(null)
  const { track } = useAnalytics()
  const lastTrackedAt = useRef(new Map<string, number>())
  const trackOnceImmediately = useCallback(
    (key: string, event: Parameters<typeof track>[0]) => {
      const now = Date.now()
      if (now - (lastTrackedAt.current.get(key) ?? 0) < 500) return
      lastTrackedAt.current.set(key, now)
      track(event)
    },
    [track],
  )
  const videoSource = useMemo(
    () =>
      resource.type === 'video' && resource.videoUrl
        ? getPublicVideoSource(resource.videoUrl)
        : undefined,
    [resource.type, resource.videoUrl],
  )
  const embedUrl = useMemo(() => {
    if (videoSource?.type !== 'embed') return undefined

    const url = new URL(videoSource.url)
    if (url.hostname === 'www.youtube.com') {
      url.searchParams.set('enablejsapi', '1')
      url.searchParams.set('origin', window.location.origin)
    }
    return url
  }, [videoSource])

  useEffect(() => {
    if (!open || !embedUrl || !embedFrameRef.current) return

    const frameWindow = embedFrameRef.current.contentWindow
    const providerOrigin = embedUrl.origin
    const isYouTube = embedUrl.hostname === 'www.youtube.com'

    const onMessage = (message: MessageEvent<unknown>) => {
      if (message.source !== frameWindow || message.origin !== providerOrigin) return

      let data = message.data
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch {
          return
        }
      }
      if (!data || typeof data !== 'object' || Array.isArray(data)) return

      const event = data as { event?: unknown; info?: unknown }
      const isPlaybackStarted = isYouTube
        ? event.event === 'onStateChange' && event.info === 1
        : event.event === 'play'
      if (!isPlaybackStarted) return

      trackOnceImmediately(`video:${resource.id}`, {
        type: 'video_viewed',
        resourceId: resource.id,
        watchedSeconds: 0,
      })
      window.removeEventListener('message', onMessage)
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [embedUrl, open, resource.id, trackOnceImmediately])

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setOpen(true)
            trackOnceImmediately(`resource:${resource.id}`, {
              type: 'resource_viewed',
              resourceId: resource.id,
              resourceType: resource.type,
            })
          }}
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
        <div className="absolute right-3 top-3">
          <ShareButton
            content={{
              kind: 'monthlyResource',
              data: {
                ...resource,
                date: monthDate,
                publicUrl: `${window.location.origin}/recursos/${resource.id}`,
              },
              files:
                resource.type === 'image' && resource.imageUrl ? [resource.imageUrl] : undefined,
              entityId: resource.id,
            }}
          />
        </div>
      </div>

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
          ) : embedUrl ? (
            <iframe
              ref={embedFrameRef}
              src={embedUrl.toString()}
              title={resource.title}
              className="size-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : videoSource?.type === 'native' ? (
            <video
              src={videoSource.url}
              controls
              autoPlay
              onPlay={(event) =>
                trackOnceImmediately(`video:${resource.id}`, {
                  type: 'video_viewed',
                  resourceId: resource.id,
                  watchedSeconds: Math.floor(event.currentTarget.currentTime),
                })
              }
              className="size-full object-contain"
            >
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
