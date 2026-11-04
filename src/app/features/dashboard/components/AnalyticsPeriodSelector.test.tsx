import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AnalyticsPeriodSelector } from './AnalyticsPeriodSelector'

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

function renderSelector(url = '/admin') {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <AnalyticsPeriodSelector />
      <LocationProbe />
    </MemoryRouter>,
  )
}

describe('AnalyticsPeriodSelector', () => {
  afterEach(() => vi.useRealTimers())

  it.each(['day', 'week', 'month', 'year'])('renders %s period from URL', (period) => {
    renderSelector(`/admin?period=${period}&reference=2026-11-03T00:00:00.000Z`)
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe(period)
  })

  it('updates the period and exposes accessible range labels', () => {
    renderSelector('/admin?period=week&reference=2026-11-03T00:00:00.000Z')
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'month' } })
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('month')
    expect(screen.getByLabelText(/Rango actual:/i)).toBeTruthy()
    expect(screen.getByRole('button', { name: /mes anterior/i })).toBeTruthy()
  })

  it('navigates backward and prevents navigating into the future', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-03T12:00:00.000Z'))
    renderSelector('/admin?period=day&reference=2026-11-03T00:00:00.000Z')
    expect(
      (screen.getByRole('button', { name: /periodo siguiente/i }) as HTMLButtonElement).disabled,
    ).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: /día anterior/i }))
    expect(screen.getByLabelText(/Rango actual:/i).textContent).toContain('2 nov 2026')
    expect(
      (screen.getByRole('button', { name: /periodo siguiente/i }) as HTMLButtonElement).disabled,
    ).toBe(false)
  })

  it('persists one stable default reference, including after a rerender and period navigation', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-03T12:00:00.000Z'))
    const { rerender } = renderSelector('/admin?period=day')

    expect(screen.getByTestId('location').textContent).toBe(
      '/admin?period=day&reference=2026-11-03T12%3A00%3A00.000Z',
    )
    rerender(
      <MemoryRouter initialEntries={['/admin?period=day']}>
        <AnalyticsPeriodSelector />
        <LocationProbe />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('location').textContent).toBe(
      '/admin?period=day&reference=2026-11-03T12%3A00%3A00.000Z',
    )
    fireEvent.click(screen.getByRole('button', { name: /día anterior/i }))
    expect(screen.getByTestId('location').textContent).toBe(
      '/admin?period=day&reference=2026-11-02T12%3A00%3A00.000Z',
    )
    fireEvent.click(screen.getByRole('button', { name: /periodo siguiente/i }))
    expect(screen.getByTestId('location').textContent).toBe(
      '/admin?period=day&reference=2026-11-03T12%3A00%3A00.000Z',
    )
  })

  it('keeps controls keyboard-focusable with visible focus styling', () => {
    renderSelector()
    const button = screen.getByRole('button', { name: /periodo siguiente/i })
    button.focus()
    expect(button.className).toContain('focus-visible:outline-2')
  })
})
