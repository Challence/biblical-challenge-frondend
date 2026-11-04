import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DashboardPage } from './DashboardPage'
import type {
  AnalyticsAudienceDistribution,
  AnalyticsDataState,
  AnalyticsRankings,
  AnalyticsSummaryPeriod,
} from './models/analyticsModels'

const {
  useAnalyticsSummaryPeriod,
  useAnalyticsRankings,
  useAnalyticsAudienceDistribution,
  useAnalyticsTimeseries,
} = vi.hoisted(() => ({
  useAnalyticsSummaryPeriod: vi.fn(),
  useAnalyticsRankings: vi.fn(),
  useAnalyticsAudienceDistribution: vi.fn(),
  useAnalyticsTimeseries: vi.fn(),
}))
vi.mock('./hooks/useAnalytics', () => ({
  useAnalyticsSummaryPeriod,
  useAnalyticsRankings,
  useAnalyticsAudienceDistribution,
  useAnalyticsTimeseries,
}))
vi.mock('./components/AnalyticsPeriodSelector', () => ({
  useAnalyticsPeriodSelector: () => ({
    query: { period: 'week', reference: '2026-11-03T12:00:00.000Z', timezone: 'UTC' },
  }),
  AnalyticsPeriodSelector: () => <div>Selector de periodo</div>,
}))

const metrics = {
  activeDevices: 10,
  sessions: 12,
  completedReadings: 8,
  viewedResources: 6,
  shares: 2,
  installations: 1,
  videoViews: 5,
  announcementClicks: 3,
  androidUsers: 7,
  iosUsers: 2,
  browserUsers: 4,
  installedUsers: 6,
}
const success = {
  status: 'success' as const,
  data: {
    period: 'week' as const,
    timezone: 'UTC',
    reference: '2026-11-03T12:00:00.000Z',
    current: { start: '', end: '', metrics },
    previous: { start: '', end: '', metrics: { ...metrics, activeDevices: 5 } },
  },
}
const rankings = {
  status: 'success' as const,
  data: {
    announcements: [{ id: 'A', title: null, total: 3 }],
    videos: [],
    resources: [],
    segmentsCompleted: [],
    segmentsShared: [],
  },
}
const audience = {
  status: 'success' as const,
  data: {
    total: 10,
    platform: {
      android: { total: 7, percentage: 70 },
      ios: { total: 2, percentage: 20 },
      other: { total: 1, percentage: 10 },
    },
    displayMode: {
      standalone: { total: 6, percentage: 60 },
      browser: { total: 4, percentage: 40 },
    },
    location: null,
    locationStatus: 'unavailable' as const,
  },
}

function setup(
  summary: AnalyticsDataState<AnalyticsSummaryPeriod> = success,
  rank: AnalyticsDataState<AnalyticsRankings> = rankings,
  users: AnalyticsDataState<AnalyticsAudienceDistribution> = audience,
) {
  useAnalyticsSummaryPeriod.mockReturnValue({ analyticsState: summary })
  useAnalyticsRankings.mockReturnValue({ analyticsState: rank })
  useAnalyticsAudienceDistribution.mockReturnValue({ analyticsState: users })
  useAnalyticsTimeseries.mockReturnValue({ analyticsState: { status: 'loading', data: undefined } })
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  )
}

describe('DashboardPage', () => {
  it('shows loading, error, empty, partial and permission states', () => {
    setup(
      { status: 'loading', data: undefined },
      { status: 'empty', data: rankings.data },
      { status: 'partial', data: audience.data },
    )
    expect(screen.getByText('Cargando las estadísticas…')).toBeTruthy()
    expect(screen.getByText('Sin datos para este tipo de contenido en el periodo.')).toBeTruthy()
    expect(screen.getByText(/no disponible/)).toBeTruthy()

    cleanup()
    setup(
      { status: 'error', data: undefined, error: new Error(), permissionDenied: true },
      { status: 'error', data: undefined, error: new Error(), permissionDenied: false },
      { status: 'error', data: undefined, error: new Error(), permissionDenied: true },
    )
    expect(screen.getByText('No tienes permisos para consultar las estadísticas.')).toBeTruthy()
    expect(screen.getByText('No se pudieron cargar los rankings.')).toBeTruthy()
  })

  it('renders complete analytics and comparison data', () => {
    setup()
    expect(screen.getByText('Dispositivos activos')).toBeTruthy()
    expect(screen.getByText('10')).toBeTruthy()
    expect(screen.getByText('+100.0% frente al periodo anterior')).toBeTruthy()
    expect(screen.getByText('Distribución de audiencia')).toBeTruthy()
    expect(screen.getByText('A')).toBeTruthy()
  })
})
