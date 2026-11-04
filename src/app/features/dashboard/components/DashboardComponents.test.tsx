import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DashboardAnalyticsState } from './DashboardAnalyticsState'
import { DashboardAudienceCard } from './DashboardAudienceCard'
import { DashboardMetricCard } from './DashboardMetricCard'
import { DashboardPopularityPanel, DashboardRankingCard } from './DashboardRankingCard'

const metrics = {
  activeDevices: 10,
  sessions: 0,
  completedReadings: 0,
  viewedResources: 0,
  shares: 0,
  installations: 0,
  videoViews: 0,
  announcementClicks: 0,
  androidUsers: 0,
  iosUsers: 0,
  browserUsers: 0,
  installedUsers: 0,
}

describe('dashboard specialized components', () => {
  it('renders metric comparison and accessible ranking states', () => {
    render(
      <>
        <DashboardMetricCard
          label="Dispositivos activos"
          description="Sesiones activas."
          metric="activeDevices"
          current={metrics}
          previous={{ ...metrics, activeDevices: 5 }}
        />
        <DashboardRankingCard
          title="Videos más vistos"
          items={[
            { id: 'video-1', title: 'Video destacado', total: 3 },
            { id: 'video-2', title: null, total: 1 },
          ]}
        />
      </>,
    )
    expect(screen.getByText('10')).toBeTruthy()
    expect(screen.getByLabelText('+100.0% frente al periodo anterior')).toBeTruthy()
    expect(screen.getByText('Video destacado')).toBeTruthy()
    expect(screen.getByText('video-2')).toBeTruthy()
  })

  it('renders audience data and explicit error state', () => {
    render(
      <>
        <DashboardAudienceCard
          data={{
            total: 1,
            platform: {
              android: { total: 1, percentage: 100 },
              ios: { total: 0, percentage: 0 },
              other: { total: 0, percentage: 0 },
            },
            displayMode: {
              standalone: { total: 1, percentage: 100 },
              browser: { total: 0, percentage: 0 },
            },
            location: null,
            locationStatus: 'unavailable',
          }}
        />
        <DashboardAnalyticsState status="error" label="las estadísticas" permissionDenied />
      </>,
    )
    expect(screen.getByText('Total: 1')).toBeTruthy()
    expect(screen.getByRole('alert').textContent).toContain('No tienes permisos')
  })

  it('keeps variable rankings inside keyboard-focusable scroll regions', () => {
    render(
      <>
        <DashboardPopularityPanel
          rankings={{
            announcements: [{ id: 'ad-1', title: 'Anuncio', total: 2 }],
            videos: [],
            resources: [],
            segmentsCompleted: [{ id: 'segment-1', title: 'Segmento', total: 4 }],
            segmentsShared: [],
          }}
        />
        <DashboardRankingCard
          title="Segmentos"
          items={[{ id: 'segment-1', title: 'Segmento', total: 4 }]}
        />
      </>,
    )

    const popularList = screen.getByLabelText('Listado de contenido popular')
    const segmentList = screen.getByRole('list', { name: 'Segmentos: listado' })
    expect(popularList.className).toContain('overflow-y-auto')
    expect(popularList.className).toContain('overflow-x-hidden')
    expect(popularList.className).toContain('min-h-0')
    expect(segmentList.className).toContain('overflow-y-auto')
    expect(segmentList.className).toContain('overflow-x-hidden')
    expect(segmentList.className).toContain('min-h-0')
  })
})
