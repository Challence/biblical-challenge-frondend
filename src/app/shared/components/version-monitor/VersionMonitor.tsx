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
const ACTIVATION_TIMEOUT = 5000
const ATTEMPTED_VERSION_KEY = 'version-monitor:attempted-version'

type VersionResponse = { version?: unknown }

export async function reloadWithUpdatedServiceWorker(onActivated?: () => void) {
  if (!('serviceWorker' in navigator)) {
    window.location.reload()
    return true
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration()
    if (!registration) {
      window.location.reload()
      return true
    }

    await registration.update()
    const waiting = await waitForWaitingWorker(registration)
    if (!waiting) return false

    const activated = await new Promise<boolean>((resolve) => {
      let settled = false
      const finish = (success: boolean) => {
        if (settled) return
        settled = true
        window.clearTimeout(timeout)
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
        waiting.removeEventListener('statechange', onStateChange)
        resolve(success)
      }
      const onControllerChange = () => finish(true)
      const onStateChange = () => {
        if (waiting.state === 'activated') finish(true)
        if (waiting.state === 'redundant') finish(false)
      }
      const timeout = window.setTimeout(() => finish(false), ACTIVATION_TIMEOUT)
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)
      waiting.addEventListener('statechange', onStateChange)
      waiting.postMessage({ type: 'SKIP_WAITING' })
      onStateChange()
    })
    if (!activated) return false
  } catch {
    // A service worker is optional; a failed update must not block the app.
    return false
  }

  onActivated?.()
  window.location.reload()
  return true
}

function waitForWaitingWorker(registration: ServiceWorkerRegistration) {
  return new Promise<ServiceWorker | null>((resolve) => {
    let settled = false
    const finish = (worker: ServiceWorker | null) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      registration.removeEventListener?.('updatefound', onUpdateFound)
      installing?.removeEventListener('statechange', onStateChange)
      resolve(worker)
    }
    let installing = registration.installing
    const check = () => {
      if (registration.waiting) {
        finish(registration.waiting)
      } else if (installing?.state === 'installed') {
        finish(installing)
      } else if (installing?.state === 'redundant') {
        finish(null)
      }
    }
    const onStateChange = () => check()
    const onUpdateFound = () => {
      installing?.removeEventListener('statechange', onStateChange)
      installing = registration.installing
      installing?.addEventListener('statechange', onStateChange)
      check()
    }
    const timeout = window.setTimeout(() => finish(null), ACTIVATION_TIMEOUT)
    registration.addEventListener?.('updatefound', onUpdateFound)
    installing?.addEventListener('statechange', onStateChange)
    check()
  })
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
      void reloadWithUpdatedServiceWorker(() => {
        try {
          if (pendingVersion.current) {
            window.sessionStorage.setItem(ATTEMPTED_VERSION_KEY, pendingVersion.current)
          }
        } catch {
          // Storage can be unavailable; the in-memory guard still prevents loops.
        }
      }).then((reloaded) => {
        if (!reloaded) reloadStarted.current = false
        setUpdateAvailable(false)
      })
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
