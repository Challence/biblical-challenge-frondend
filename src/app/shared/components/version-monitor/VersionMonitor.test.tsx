import '@testing-library/jest-dom/vitest'
import { act, render, screen } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

import { VersionMonitor, reloadWithUpdatedServiceWorker } from './VersionMonitor'

declare const __APP_VERSION__: string

const [major, minor, patch] = __APP_VERSION__.split('-')[0].split('.').map(Number)
const updatedVersion = `${major}.${minor}.${patch + 1}`

describe('VersionMonitor', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('fetch', vi.fn())
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('does not show an update when the version is equal', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ version: __APP_VERSION__ }),
    } as Response)
    render(<VersionMonitor />)
    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows a new version and reloads only after the worker activates', async () => {
    const waiting = new EventTarget() as ServiceWorker
    Object.defineProperty(waiting, 'state', { value: 'installed', writable: true })
    waiting.postMessage = vi.fn()
    const registration = { waiting, update: vi.fn().mockResolvedValue(undefined) }
    vi.stubGlobal('navigator', {
      serviceWorker: {
        getRegistration: vi.fn().mockResolvedValue(registration),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    })
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ version: updatedVersion }),
    } as Response)
    const reload = vi.fn()
    Object.defineProperty(window, 'location', { configurable: true, value: { reload } })
    render(<VersionMonitor />)
    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })
    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(reload).not.toHaveBeenCalled()
    Object.defineProperty(waiting, 'state', { value: 'activated' })
    await act(async () => {
      waiting.dispatchEvent(new Event('statechange'))
      await Promise.resolve()
    })
    expect(reload).toHaveBeenCalledOnce()
    expect(window.sessionStorage.getItem('version-monitor:attempted-version')).toBe(updatedVersion)
  })

  it('does not mark a version when worker activation fails', async () => {
    const waiting = new EventTarget() as ServiceWorker
    Object.defineProperty(waiting, 'state', { value: 'installed' })
    waiting.postMessage = vi.fn()
    vi.stubGlobal('navigator', {
      serviceWorker: {
        getRegistration: vi.fn().mockResolvedValue({
          waiting,
          update: vi.fn().mockResolvedValue(undefined),
        }),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    })
    const mark = vi.fn()
    const reload = vi.fn()
    Object.defineProperty(window, 'location', { configurable: true, value: { reload } })
    const result = reloadWithUpdatedServiceWorker(mark)
    await vi.advanceTimersByTimeAsync(5000)
    expect(await result).toBe(false)
    expect(mark).not.toHaveBeenCalled()
    expect(window.sessionStorage.getItem('version-monitor:attempted-version')).toBeNull()
    expect(reload).not.toHaveBeenCalled()
  })

  it('waits for an installing worker and reloads after activation', async () => {
    const installing = new EventTarget() as ServiceWorker
    let state = 'installing'
    Object.defineProperty(installing, 'state', { get: () => state })
    installing.postMessage = vi.fn()
    const registration = {
      installing,
      waiting: null,
      update: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    const serviceWorker = new EventTarget() as ServiceWorkerContainer
    serviceWorker.getRegistration = vi.fn().mockResolvedValue(registration)
    vi.stubGlobal('navigator', { serviceWorker })
    const reload = vi.fn()
    Object.defineProperty(window, 'location', { configurable: true, value: { reload } })
    const promise = reloadWithUpdatedServiceWorker()
    state = 'installed'
    await act(async () => installing.dispatchEvent(new Event('statechange')))
    expect(installing.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(reload).not.toHaveBeenCalled()
    state = 'activated'
    await act(async () => installing.dispatchEvent(new Event('statechange')))
    expect(await promise).toBe(true)
    expect(reload).toHaveBeenCalledOnce()
  })

  it('does not reload when an installing worker times out', async () => {
    const installing = new EventTarget() as ServiceWorker
    Object.defineProperty(installing, 'state', { value: 'installing' })
    installing.postMessage = vi.fn()
    const registration = {
      installing,
      waiting: null,
      update: vi.fn().mockResolvedValue(undefined),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
    vi.stubGlobal('navigator', {
      serviceWorker: { getRegistration: vi.fn().mockResolvedValue(registration) },
    })
    const reload = vi.fn()
    Object.defineProperty(window, 'location', { configurable: true, value: { reload } })
    const promise = reloadWithUpdatedServiceWorker()
    await vi.advanceTimersByTimeAsync(5000)
    expect(await promise).toBe(false)
    expect(reload).not.toHaveBeenCalled()
  })

  it('keeps the app usable when no worker is available', async () => {
    vi.stubGlobal('navigator', {})
    const reload = vi.fn()
    Object.defineProperty(window, 'location', { configurable: true, value: { reload } })
    await reloadWithUpdatedServiceWorker()
    expect(reload).toHaveBeenCalledOnce()
  })
})
