import { tv } from '@/app/shared/lib/tv'
import {
  IconAd,
  IconDeviceDesktop,
  IconEye,
  IconPlayerPlay,
  IconShare,
  IconBook2,
} from '@tabler/icons-react'
import {
  AnalyticsPeriodSelector,
  useAnalyticsPeriodSelector,
} from './components/AnalyticsPeriodSelector'
import { DashboardAnalyticsState } from './components/DashboardAnalyticsState'
import { DashboardActivityPanel } from './components/DashboardActivityPanel'
import { DashboardAudienceCard } from './components/DashboardAudienceCard'
import { DashboardMetricCard } from './components/DashboardMetricCard'
import { DashboardPopularityPanel, DashboardRankingCard } from './components/DashboardRankingCard'
import {
  useAnalyticsAudienceDistribution,
  useAnalyticsRankings,
  useAnalyticsSummaryPeriod,
  useAnalyticsTimeseries,
} from './hooks/useAnalytics'
import type { AnalyticsMetric } from './models/analyticsModels'

const styles = tv({
  slots: {
    root: 'mx-auto max-w-[88rem] pb-8',
    heading:
      'mb-5 flex items-center justify-between gap-6 max-[42rem]:mb-5 max-[42rem]:items-start max-[42rem]:flex-col',
    title:
      'm-0 font-heading text-[clamp(1.75rem,3vw,2.25rem)] leading-[1.1] tracking-[-0.04em] text-foreground',
    grid: 'grid grid-cols-2 gap-4 max-[42rem]:grid-cols-1 max-[42rem]:gap-4',
  },
})

const metrics: Array<[keyof AnalyticsMetric, string, string]> = [
  ['activeDevices', 'Dispositivos activos', 'Dispositivos únicos con sesión iniciada.'],
  ['completedReadings', 'Lecturas completadas', 'Lecturas marcadas como completadas.'],
  ['viewedResources', 'Recursos vistos', 'Aperturas de recursos públicos.'],
  ['shares', 'Compartidos', 'Contenidos compartidos correctamente.'],
  ['videoViews', 'Videos vistos', 'Aperturas de videos públicos.'],
  ['announcementClicks', 'Clics en anuncios', 'Clics en anuncios públicos.'],
]

const metricIcons: Partial<Record<keyof AnalyticsMetric, typeof IconDeviceDesktop>> = {
  activeDevices: IconDeviceDesktop,
  completedReadings: IconBook2,
  viewedResources: IconEye,
  shares: IconShare,
  videoViews: IconPlayerPlay,
  announcementClicks: IconAd,
}

export function DashboardPage() {
  const root = styles()
  const { query } = useAnalyticsPeriodSelector()
  const summary = useAnalyticsSummaryPeriod(query)
  const timeseries = useAnalyticsTimeseries(query)
  const rankings = useAnalyticsRankings(query)
  const audience = useAnalyticsAudienceDistribution(query)
  const summaryData =
    summary.analyticsState.status === 'success' || summary.analyticsState.status === 'partial'
      ? summary.analyticsState.data
      : undefined

  return (
    <section className={root.root()} aria-labelledby="dashboard-title">
      <div className={root.heading()}>
        <h1 className={root.title()} id="dashboard-title">
          Dashboard
        </h1>
        <AnalyticsPeriodSelector />
      </div>

      <DashboardAnalyticsState
        status={summary.analyticsState.status}
        permissionDenied={
          summary.analyticsState.status === 'error' && summary.analyticsState.permissionDenied
        }
        label="las estadísticas"
      />
      {summaryData ? (
        <>
          <div className="grid grid-cols-6 gap-4 max-[76rem]:grid-cols-3 max-[42rem]:grid-cols-1">
            {metrics.map(([metric, label, description]) => (
              <DashboardMetricCard
                key={metric}
                icon={metricIcons[metric]}
                metric={metric}
                label={label}
                description={description}
                current={summaryData.current.metrics}
                previous={summaryData.previous.metrics}
              />
            ))}
          </div>
          <p className="mt-2 text-sm font-bold text-muted-foreground">
            Evolución: comparación con el periodo anterior disponible para cada métrica.
          </p>
        </>
      ) : null}

      <div className="mt-4 grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-stretch gap-4 max-[64rem]:grid-cols-1">
        <div className="min-w-0">
          <DashboardActivityPanel state={timeseries.analyticsState} />
        </div>
        <div className="min-w-0">
          {rankings.analyticsState.data ? (
            <DashboardPopularityPanel
              rankings={rankings.analyticsState.data}
              status={rankings.analyticsState.status}
            />
          ) : (
            <div className="flex min-h-[17rem] flex-col justify-center rounded-[var(--shape-16)] border border-border bg-card p-4 text-center shadow-[var(--elevation-card)]">
              <h2 className="m-0 font-heading text-base font-bold">Contenido más popular</h2>
              <DashboardAnalyticsState
                status={rankings.analyticsState.status}
                permissionDenied={
                  rankings.analyticsState.status === 'error' &&
                  rankings.analyticsState.permissionDenied
                }
                label="los rankings"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 items-stretch gap-4 max-[64rem]:grid-cols-1">
        <div className="min-w-0">
          {audience.analyticsState.data ? (
            <DashboardAudienceCard data={audience.analyticsState.data} />
          ) : (
            <div className="flex min-h-[11.25rem] flex-col justify-center rounded-[var(--shape-16)] border border-border bg-card p-4 text-center shadow-[var(--elevation-card)]">
              <h2 className="m-0 font-heading text-[0.9375rem] font-bold text-muted-foreground">
                Distribución de audiencia
              </h2>
              <DashboardAnalyticsState
                status={audience.analyticsState.status}
                permissionDenied={
                  audience.analyticsState.status === 'error' &&
                  audience.analyticsState.permissionDenied
                }
                label="la audiencia"
              />
            </div>
          )}
        </div>
        <DashboardRankingCard
          title="Segmentos con más lecturas completadas"
          items={rankings.analyticsState.data?.segmentsCompleted ?? []}
        />
        <DashboardRankingCard
          title="Anuncios con más clics"
          items={rankings.analyticsState.data?.announcements ?? []}
        />
      </div>
    </section>
  )
}
