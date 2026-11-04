import '@testing-library/jest-dom/vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAnalytics } from './useAnalytics'

const QUEUE_STORAGE_KEY = 'analytics-pending-events'
const MAX_QUEUE_SIZE = 50

const { invoke } = vi.hoisted(() => ({
  invoke: vi.fn().mockResolvedValue({ error: null }),
}))

vi.mock('@/app/shared/lib/supabase', () => ({
  supabase: { functions: { invoke } },
}))

function pendingEvents() {
  return JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY) ?? '[]') as Array<{
    payload: { eventId: string; event: { path?: string } }
    retries: number
  }>
}

describe('useAnalytics', () => {
  beforeEach(() => {
    invoke.mockReset()
    invoke.mockResolvedValue({ error: null })
    localStorage.clear()
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('provides a non-blocking tracker with stable anonymous context', () => {
    const { result } = renderHook(() => useAnalytics())

    expect(() => result.current.track({ type: 'page_viewed', path: '/inicio' })).not.toThrow()
    expect(localStorage.getItem('analytics-anonymous-id')).toBeTruthy()
    expect(localStorage.getItem('analytics-session-id')).toBeTruthy()
  })

  it('supports trackClick while preserving the original callback result', async () => {
    const { result } = renderHook(() => useAnalytics())
    const callback = vi.fn((value: string) => `done:${value}`)

    const handler = result.current.trackClick(
      { type: 'announcement_clicked', announcementId: 'a' },
      callback,
    )
    expect(handler('value')).toBe('done:value')
    expect(callback).toHaveBeenCalledWith('value')
    await waitFor(() => expect(invoke).toHaveBeenCalled())
  })

  it('keeps identical actions as separate pending events', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
    const { result } = renderHook(() => useAnalytics())
    const event = { type: 'page_viewed' as const, path: '/duplicated' }

    result.current.track(event)
    result.current.track(event)

    const queued = pendingEvents()
    expect(queued).toHaveLength(2)
    expect(queued[0].payload.eventId).not.toBe(queued[1].payload.eventId)

    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
    window.dispatchEvent(new Event('online'))
    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(2))
  })

  it('restores pending events after a module reimport', async () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
    const first = renderHook(() => useAnalytics())
    first.result.current.track({ type: 'segment_viewed', segmentId: 'offline' })
    expect(pendingEvents()).toHaveLength(1)
    first.unmount()

    vi.resetModules()
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true })
    const { useAnalytics: restoredUseAnalytics } = await import('./useAnalytics')
    renderHook(() => restoredUseAnalytics())

    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1))
    expect(pendingEvents()).toEqual([])
  })

  it('removes persisted events after a successful delivery', async () => {
    const { result } = renderHook(() => useAnalytics())
    result.current.track({ type: 'resource_viewed', resourceId: 'resource', resourceType: 'video' })

    await waitFor(() => expect(invoke).toHaveBeenCalledTimes(1))
    expect(pendingEvents()).toEqual([])
  })

  it('persists retry state and drops an event after the retry limit', async () => {
    vi.useFakeTimers()
    invoke.mockRejectedValue(new Error('temporary failure'))
    const { result } = renderHook(() => useAnalytics())

    result.current.track({ type: 'video_viewed', resourceId: 'retry', watchedSeconds: 1 })
    await vi.runAllTimersAsync()

    expect(invoke).toHaveBeenCalledTimes(3)
    expect(pendingEvents()).toEqual([])
  })

  it('bounds persisted offline events by discarding the oldest entry', () => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: false })
    const { result } = renderHook(() => useAnalytics())

    for (let index = 0; index <= MAX_QUEUE_SIZE; index += 1) {
      result.current.track({ type: 'page_viewed', path: `/${index}` })
    }

    const queued = pendingEvents()
    expect(queued).toHaveLength(MAX_QUEUE_SIZE)
    expect(queued.map((item) => item.payload.event.path)).not.toContain('/0')
    expect(queued.map((item) => item.payload.event.path)).toContain('/50')
  })

  it('keeps tracking safely in memory when storage is blocked', () => {
    const originalStorage = Object.getOwnPropertyDescriptor(window, 'localStorage')
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get: () => {
        throw new Error('blocked')
      },
    })

    try {
      const { result } = renderHook(() => useAnalytics())
      expect(() => result.current.track({ type: 'page_viewed', path: '/blocked' })).not.toThrow()
    } finally {
      if (originalStorage) Object.defineProperty(window, 'localStorage', originalStorage)
    }
  })

  it('keeps the anonymous id, renews active sessions, and expires inactive sessions', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const first = renderHook(() => useAnalytics())
    first.result.current.track({ type: 'page_viewed', path: '/one' })
    const anonymousId = localStorage.getItem('analytics-anonymous-id')
    const firstSession = localStorage.getItem('analytics-session-id')

    vi.advanceTimersByTime(29 * 60 * 1000)
    first.result.current.track({ type: 'page_viewed', path: '/two' })
    expect(localStorage.getItem('analytics-session-id')).toBe(firstSession)
    vi.advanceTimersByTime(31 * 60 * 1000)
    first.result.current.track({ type: 'page_viewed', path: '/three' })
    expect(localStorage.getItem('analytics-session-id')).not.toBe(firstSession)
    expect(localStorage.getItem('analytics-anonymous-id')).toBe(anonymousId)
  })
})
