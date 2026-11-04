import { useCallback, useMemo } from 'react'
import { supabase } from '@/app/shared/lib/supabase'
import type { AnalyticsContext, AnalyticsEvent, AnalyticsPayload } from './analyticsEvents'

const ANONYMOUS_ID_KEY = 'analytics-anonymous-id'
const SESSION_ID_KEY = 'analytics-session-id'
const SESSION_LAST_ACTIVITY_KEY = 'analytics-session-last-activity'
const QUEUE_STORAGE_KEY = 'analytics-pending-events'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000
const MAX_QUEUE_SIZE = 50
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 1000

type QueuedPayload = { payload: AnalyticsPayload; retries: number }
const queue: QueuedPayload[] = []
let draining = false
let retryTimer: ReturnType<typeof setTimeout> | undefined

const createId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`

const memoryStorage = new Map<string, string>()

function storageGet(key: string) {
  try {
    return window.localStorage?.getItem(key) ?? memoryStorage.get(key) ?? null
  } catch {
    return memoryStorage.get(key) ?? null
  }
}

function storageSet(key: string, value: string) {
  memoryStorage.set(key, value)
  try {
    window.localStorage?.setItem(key, value)
  } catch {
    // Storage may be blocked or unavailable.
  }
}

function getStoredId(key: string) {
  const stored = storageGet(key)
  if (stored) return stored
  const value = createId()
  storageSet(key, value)
  return value
}

function getSessionId(touch = false) {
  const now = Date.now()
  const lastActivity = Number(storageGet(SESSION_LAST_ACTIVITY_KEY))
  let sessionId = storageGet(SESSION_ID_KEY)
  if (!sessionId || (Number.isFinite(lastActivity) && now - lastActivity > SESSION_TIMEOUT_MS)) {
    sessionId = createId()
    storageSet(SESSION_ID_KEY, sessionId)
  }
  if (touch) storageSet(SESSION_LAST_ACTIVITY_KEY, String(now))
  return sessionId
}

function getOperatingSystem(): AnalyticsContext['os'] {
  const userAgent = navigator.userAgent.toLowerCase()
  if (/android/.test(userAgent)) return 'android'
  if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
  return 'other'
}

function getDisplayMode(): AnalyticsContext['displayMode'] {
  return window.matchMedia?.('(display-mode: standalone)').matches ? 'standalone' : 'browser'
}

function getContext(touchSession = false): AnalyticsContext {
  return {
    anonymousId: getStoredId(ANONYMOUS_ID_KEY),
    sessionId: getSessionId(touchSession),
    path: window.location.pathname,
    os: getOperatingSystem(),
    displayMode: getDisplayMode(),
    locale: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }
}

function isQueuedPayload(value: unknown): value is QueuedPayload {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<QueuedPayload>
  return (
    typeof item.retries === 'number' &&
    Number.isInteger(item.retries) &&
    item.retries >= 0 &&
    !!item.payload &&
    typeof item.payload.eventId === 'string' &&
    !!item.payload.event &&
    !!item.payload.context &&
    typeof item.payload.occurredAt === 'string'
  )
}

function persistQueue() {
  storageSet(QUEUE_STORAGE_KEY, JSON.stringify(queue))
}

function restoreQueue() {
  const stored = storageGet(QUEUE_STORAGE_KEY)
  if (!stored) return
  try {
    const restored = JSON.parse(stored)
    if (!Array.isArray(restored)) return
    const eventIds = new Set<string>()
    for (const item of restored) {
      if (!isQueuedPayload(item) || eventIds.has(item.payload.eventId)) continue
      eventIds.add(item.payload.eventId)
      queue.push(item)
      if (queue.length === MAX_QUEUE_SIZE) break
    }
    persistQueue()
  } catch {
    storageSet(QUEUE_STORAGE_KEY, '[]')
  }
}

async function send(payload: AnalyticsPayload) {
  if (!supabase) return true
  const { error } = await supabase.functions.invoke('analytics-events', { body: payload })
  if (error) throw error
  return true
}

function scheduleDrain() {
  if (retryTimer !== undefined) return
  retryTimer = setTimeout(() => {
    retryTimer = undefined
    void drain()
  }, RETRY_DELAY_MS)
}

async function drain() {
  if (draining || !navigator.onLine) return
  draining = true
  try {
    while (queue.length > 0 && navigator.onLine) {
      const item = queue[0]
      try {
        await send(item.payload)
        queue.shift()
        persistQueue()
      } catch {
        item.retries += 1
        if (item.retries >= MAX_RETRIES) {
          queue.shift()
        }
        persistQueue()
        if (item.retries < MAX_RETRIES) {
          scheduleDrain()
          break
        }
      }
    }
  } finally {
    draining = false
  }
}

function enqueue(payload: AnalyticsPayload) {
  if (queue.some((item) => item.payload.eventId === payload.eventId)) return
  if (queue.length >= MAX_QUEUE_SIZE) queue.shift()
  queue.push({ payload, retries: 0 })
  persistQueue()
  void drain()
}

export function useAnalytics() {
  const context = useMemo(() => getContext(), [])
  const getCurrentSessionId = useCallback(() => getSessionId(), [])
  const track = useCallback(
    (event: AnalyticsEvent) => {
      const currentContext = { ...getContext(true), anonymousId: context.anonymousId }
      enqueue({
        eventId: createId(),
        event,
        context: currentContext,
        occurredAt: new Date().toISOString(),
      })
    },
    [context],
  )

  const trackClick = useCallback(
    <T extends unknown[]>(event: AnalyticsEvent, callback?: (...args: T) => unknown) =>
      (...args: T) => {
        track(event)
        return callback?.(...args)
      },
    [track],
  )

  return { track, trackClick, getCurrentSessionId }
}

restoreQueue()

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => void drain())
  void drain()
}
