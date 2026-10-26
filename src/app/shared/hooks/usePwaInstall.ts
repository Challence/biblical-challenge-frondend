import { useEffect, useState } from 'react'

const DISMISS_KEY = 'pwa-install-dismissed-at'
const DISMISS_FOR_MS = 7 * 24 * 60 * 60 * 1000

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
}

function wasDismissedRecently() {
  const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY))
  return Number.isFinite(dismissedAt) && dismissedAt > Date.now() - DISMISS_FOR_MS
}

export function usePwaInstall() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null)
  const [isIosDevice] = useState(() => typeof window !== 'undefined' && isIos())
  const [isStandaloneMode, setIsStandaloneMode] = useState(() => typeof window === 'undefined' || isStandalone())
  const [dismissed, setDismissed] = useState(() => typeof window === 'undefined' || wasDismissedRecently())

  useEffect(() => {
    const updateDisplayMode = () => setIsStandaloneMode(isStandalone())
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as InstallPromptEvent)
    }
    const onInstalled = () => {
      setPromptEvent(null)
      setIsStandaloneMode(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener?.('change', updateDisplayMode)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
      mediaQuery.removeEventListener?.('change', updateDisplayMode)
    }
  }, [])

  const dismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setDismissed(true)
  }

  const install = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const choice = await promptEvent.userChoice
    setPromptEvent(null)
    if (choice.outcome === 'dismissed') dismiss()
  }

  const canInstall = Boolean(promptEvent) || isIosDevice
  return { canInstall: canInstall && !isStandaloneMode && !dismissed, isIos: isIosDevice, install, dismiss }
}
