import { useEffect, useRef, useState } from 'react'
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
const RELOAD_WAIT = 1500
const ATTEMPTED_VERSION_KEY = 'version-monitor:attempted-version'

type VersionResponse = { version?: unknown }

async function reloadWithUpdatedServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    window.location.reload()
    return
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      window.location.reload()
      return
    }

    await registration.update().catch(() => undefined)
    const waiting = registration.waiting
    if (!waiting) {
      window.location.reload()
      return
    }

    await new Promise<void>((resolve) => {
      let settled = false
      const finish = () => {
        if (settled) return
        settled = true
        window.clearTimeout(timeout)
        navigator.serviceWorker.removeEventListener('controllerchange', finish)
        resolve()
      }
      const timeout = window.setTimeout(finish, RELOAD_WAIT)
      navigator.serviceWorker.addEventListener('controllerchange', finish, { once: true })
      waiting.postMessage({ type: 'SKIP_WAITING' })
    })
  } catch {
    // A service worker is optional; a failed update must not block reload.
  }

  window.location.reload()
}

export function VersionMonitor() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [seconds, setSeconds] = useState(5)
  const reloadStarted = useRef(false)
  const pendingVersion = useRef<string | null>(null)

  useEffect(() => {
    let disposed = false

    const checkVersion = async () => {
      try {
        const response = await fetch(`/version.json?ts=${Date.now()}`, { cache: 'no-store' })
        if (!response.ok) return
        const data = (await response.json()) as VersionResponse
        let attemptedVersion: string | null = null
        try {
          attemptedVersion = window.sessionStorage.getItem(ATTEMPTED_VERSION_KEY)
        } catch {
          // Storage can be unavailable; version monitoring remains best effort.
        }
        if (
          !disposed &&
          typeof data.version === 'string' &&
          data.version !== __APP_VERSION__ &&
          attemptedVersion !== data.version
        ) {
          pendingVersion.current = data.version
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
    const timer = window.setTimeout(() => {
      if (reloadStarted.current) return
      reloadStarted.current = true
      try {
        if (pendingVersion.current) {
          window.sessionStorage.setItem(ATTEMPTED_VERSION_KEY, pendingVersion.current)
        }
      } catch {
        // Storage can be unavailable; the in-memory guard still prevents loops.
      }
      void reloadWithUpdatedServiceWorker()
    }, 5000)
    const countdown = window.setInterval(
      () => setSeconds((current) => Math.max(current - 1, 0)),
      1000,
    )
    return () => {
      window.clearTimeout(timer)
      window.clearInterval(countdown)
    }
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
