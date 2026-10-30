import { useEffect, useState } from 'react'
import { Button } from '@/app/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'

declare const __APP_VERSION__: string

const CHECK_INTERVAL = 5 * 60 * 1000

type VersionResponse = { version?: unknown }

async function reloadWithUpdatedServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update().catch(() => undefined)
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' })
      }
    } catch {
      // A service worker is optional; a failed update must not block reload.
    }
  }
  window.location.reload()
}

export function VersionMonitor() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [seconds, setSeconds] = useState(5)

  useEffect(() => {
    let disposed = false

    const checkVersion = async () => {
      try {
        const response = await fetch(`/version.json?ts=${Date.now()}`, { cache: 'no-store' })
        if (!response.ok) return
        const data = (await response.json()) as VersionResponse
        if (!disposed && typeof data.version === 'string' && data.version !== __APP_VERSION__) {
          setSeconds(5)
          setUpdateAvailable(true)
        }
      } catch {
        // Version checks are best effort and must never interrupt the app.
      }
    }

    void checkVersion()
    const interval = window.setInterval(checkVersion, CHECK_INTERVAL)
    return () => {
      disposed = true
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!updateAvailable) return
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          void reloadWithUpdatedServiceWorker()
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [updateAvailable])

  return (
    <Dialog open={updateAvailable} onOpenChange={() => undefined}>
      <DialogContent aria-describedby="version-update-description">
        <DialogHeader>
          <DialogTitle>Actualización disponible</DialogTitle>
          <DialogDescription id="version-update-description">
            Hay una nueva versión disponible. La página se actualizará en {seconds} segundos.
          </DialogDescription>
        </DialogHeader>
        <Button disabled aria-label="Actualización en curso">
          Actualizando…
        </Button>
      </DialogContent>
    </Dialog>
  )
}
