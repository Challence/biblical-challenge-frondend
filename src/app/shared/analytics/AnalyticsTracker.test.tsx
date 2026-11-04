import '@testing-library/jest-dom/vitest'
import { render, act } from '@testing-library/react'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AnalyticsTracker } from './AnalyticsTracker'

const { track, getCurrentSessionId } = vi.hoisted(() => ({
  track: vi.fn(),
  getCurrentSessionId: vi.fn(() => 'session-1'),
}))

vi.mock('./useAnalytics', () => ({ useAnalytics: () => ({ track, getCurrentSessionId }) }))

function NavigateTo({ path }: { path: string }) {
  const navigate = useNavigate()
  return <button onClick={() => navigate(path)}>navigate</button>
}

describe('AnalyticsTracker', () => {
  beforeEach(() => {
    track.mockClear()
    getCurrentSessionId.mockReturnValue('session-1')
    sessionStorage.clear()
    localStorage.clear()
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({ matches: false })),
    })
  })

  it('tracks one session and one page view per valid navigation, not per rerender', () => {
    const view = render(
      <MemoryRouter initialEntries={['/inicio']}>
        <AnalyticsTracker />
        <NavigateTo path="/lecturas" />
      </MemoryRouter>,
    )

    expect(track.mock.calls.map(([event]) => event)).toEqual([
      { type: 'session_started' },
      { type: 'page_viewed', path: '/inicio' },
    ])
    view.rerender(
      <MemoryRouter initialEntries={['/inicio']}>
        <AnalyticsTracker />
        <NavigateTo path="/lecturas" />
      </MemoryRouter>,
    )
    expect(track).toHaveBeenCalledTimes(2)
    act(() => view.getByRole('button', { name: 'navigate' }).click())
    expect(track).toHaveBeenLastCalledWith({ type: 'page_viewed', path: '/lecturas' })
  })

  it.each([
    ['android', 'Mozilla/5.0 Android', false],
    ['ios', 'Mozilla/5.0 iPhone', false],
    ['standalone', 'Mozilla/5.0 Android', true],
  ])('records installation once in %s mode', (_name, userAgent, standalone) => {
    Object.defineProperty(navigator, 'userAgent', { configurable: true, value: userAgent })
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn(() => ({ matches: standalone })),
    })
    const view = render(
      <MemoryRouter initialEntries={['/']}>
        <AnalyticsTracker />
      </MemoryRouter>,
    )
    act(() => window.dispatchEvent(new Event('appinstalled')))
    act(() => window.dispatchEvent(new Event('appinstalled')))
    expect(track.mock.calls.filter(([event]) => event.type === 'pwa_installed')).toHaveLength(1)
    view.unmount()
    window.dispatchEvent(new Event('appinstalled'))
    expect(track.mock.calls.filter(([event]) => event.type === 'pwa_installed')).toHaveLength(1)
  })
})
