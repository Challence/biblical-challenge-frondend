import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AnalyticsTimeseries } from '../models/analyticsModels'
import { DashboardActivityPanel } from './DashboardActivityPanel'

const data: AnalyticsTimeseries = {
  period: 'day',
  timezone: 'UTC',
  start: '2026-11-03T00:00:00Z',
  end: '2026-11-04T00:00:00Z',
  points: [
    {
      start: '2026-11-03T00:00:00Z',
      end: '2026-11-03T01:00:00Z',
      metrics: {
        activeDevices: 2,
        sessions: 3,
        completedReadings: 0,
        viewedResources: 1,
        shares: 0,
        videoViews: 0,
        announcementClicks: 0,
      },
    },
    {
      start: '2026-11-03T01:00:00Z',
      end: '2026-11-03T02:00:00Z',
      metrics: {
        activeDevices: 4,
        sessions: 5,
        completedReadings: 2,
        viewedResources: 3,
        shares: 1,
        videoViews: 2,
        announcementClicks: 1,
      },
    },
  ],
}

describe('DashboardActivityPanel', () => {
  it('renders a selectable accessible activity summary and data table', () => {
    render(<DashboardActivityPanel state={{ status: 'success', data }} />)
    expect(screen.getByRole('img', { name: /Total 6, promedio 3.0, pico 4/ })).toBeTruthy()
    expect(screen.getByRole('table')).toBeTruthy()
    screen.getByLabelText('Métrica').querySelector('select')
  })

  it('renders loading, empty, and permission states', () => {
    const { rerender } = render(
      <DashboardActivityPanel state={{ status: 'loading', data: undefined }} />,
    )
    expect(screen.getByText('Cargando actividad…')).toBeTruthy()
    rerender(<DashboardActivityPanel state={{ status: 'empty', data: { ...data, points: [] } }} />)
    expect(screen.getByText('Sin datos de actividad en este periodo.')).toBeTruthy()
    rerender(
      <DashboardActivityPanel
        state={{ status: 'error', data: undefined, error: new Error(), permissionDenied: true }}
      />,
    )
    expect(screen.getByRole('alert').textContent).toContain('No tienes permisos')
  })
})
