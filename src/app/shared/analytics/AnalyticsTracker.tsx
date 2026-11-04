import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAnalytics } from './useAnalytics'

const SESSION_EVENT_KEY = 'analytics-session-event-sent'
const INSTALL_EVENT_KEY = 'analytics-install-event-sent'
let memorySessionEventId: string | undefined

function safeStorageGet(storage: Storage | undefined, key: string) {
  try {
    return storage?.getItem(key) ?? null
  } catch {
    return null
  }
}

function safeStorageSet(storage: Storage | undefined, key: string, value: string) {
  try {
    storage?.setItem(key, value)
  } catch {
    // Storage may be blocked or unavailable.
  }
}

function hasSessionEvent(storage: Storage | undefined, sessionId: string) {
  return (
    safeStorageGet(storage, SESSION_EVENT_KEY) === sessionId || memorySessionEventId === sessionId
  )
}

function markSessionEvent(storage: Storage | undefined, sessionId: string) {
  memorySessionEventId = sessionId
  safeStorageSet(storage, SESSION_EVENT_KEY, sessionId)
}

export function AnalyticsTracker() {
  const location = useLocation()
  const { track, getCurrentSessionId } = useAnalytics()

  useEffect(() => {
    let sessionStorage: Storage | undefined
    try {
      sessionStorage = window.sessionStorage
    } catch {
      sessionStorage = undefined
    }
    const sessionId = getCurrentSessionId()
    if (hasSessionEvent(sessionStorage, sessionId)) return
    markSessionEvent(sessionStorage, sessionId)
    track({ type: 'session_started' })
  }, [getCurrentSessionId, track])

  useEffect(() => {
    let sessionStorage: Storage | undefined
    try {
      sessionStorage = window.sessionStorage
    } catch {
      sessionStorage = undefined
    }
    const sessionId = getCurrentSessionId()
    if (!hasSessionEvent(sessionStorage, sessionId)) {
      markSessionEvent(sessionStorage, sessionId)
      track({ type: 'session_started' })
    }
    track({ type: 'page_viewed', path: location.pathname })
  }, [getCurrentSessionId, location.pathname, track])

  useEffect(() => {
    const recordInstall = (source: 'appinstalled' | 'standalone') => {
      let localStorage: Storage | undefined
      try {
        localStorage = window.localStorage
      } catch {
        localStorage = undefined
      }
      if (safeStorageGet(localStorage, INSTALL_EVENT_KEY)) return
      safeStorageSet(localStorage, INSTALL_EVENT_KEY, 'true')
      track({ type: 'pwa_installed', source })
    }
    const onInstalled = () => recordInstall('appinstalled')
    window.addEventListener('appinstalled', onInstalled)
    if (window.matchMedia?.('(display-mode: standalone)').matches) recordInstall('standalone')
    return () => window.removeEventListener('appinstalled', onInstalled)
  }, [track])

  return null
}
