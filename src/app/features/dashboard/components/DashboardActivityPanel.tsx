import { useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type {
  AnalyticsDataState,
  AnalyticsMetric,
  AnalyticsTimeseries,
} from '../models/analyticsModels'

type ActivityMetric = keyof AnalyticsTimeseries['points'][number]['metrics'] & keyof AnalyticsMetric

const metricOptions: Array<{ value: ActivityMetric; label: string }> = [
  { value: 'activeDevices', label: 'Dispositivos activos' },
  { value: 'sessions', label: 'Sesiones' },
  { value: 'completedReadings', label: 'Lecturas completadas' },
  { value: 'viewedResources', label: 'Recursos vistos' },
  { value: 'shares', label: 'Compartidos' },
  { value: 'videoViews', label: 'Videos vistos' },
  { value: 'announcementClicks', label: 'Clics en anuncios' },
]

type Props = {
  state?: AnalyticsDataState<AnalyticsTimeseries>
  data?: AnalyticsTimeseries
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('es').format(value)
}

export function DashboardActivityPanel({ state: providedState, data: propData }: Props) {
  const state =
    providedState ??
    (propData ? { status: 'success', data: propData } : { status: 'empty', data: undefined })
  const [metric, setMetric] = useState<ActivityMetric>('activeDevices')
  const data =
    state.status === 'success' || state.status === 'partial' || state.status === 'empty'
      ? state.data
      : undefined
  const values = data?.points.map((point) => point.metrics[metric]) ?? []
  const total = values.reduce((sum, value) => sum + value, 0)
  const average = values.length ? total / values.length : 0
  const peak = values.length ? Math.max(...values) : 0
  const metricLabel = metricOptions.find((option) => option.value === metric)?.label ?? metric
  const summary = useMemo(
    () =>
      `Total ${formatNumber(total)}, promedio ${average.toFixed(1)}, pico ${formatNumber(peak)}`,
    [average, peak, total],
  )

  if (state.status === 'loading')
    return (
      <section
        aria-busy="true"
        className="flex min-h-[17rem] flex-col justify-center rounded-[var(--shape-16)] border border-border bg-card p-4 text-center shadow-[var(--elevation-card)]"
      >
        <h2 className="m-0 text-lg font-extrabold">Actividad</h2>
        <p className="mt-2 text-muted-foreground">Cargando actividad…</p>
      </section>
    )
  if (state.status === 'error')
    return (
      <section
        role="alert"
        className="flex min-h-[17rem] flex-col justify-center rounded-[var(--shape-16)] border border-border bg-card p-4 text-center shadow-[var(--elevation-card)]"
      >
        <h2 className="m-0 text-lg font-extrabold">Actividad</h2>
        <p className="mt-2 text-muted-foreground">
          {state.permissionDenied
            ? 'No tienes permisos para consultar la actividad.'
            : 'No se pudo cargar la actividad.'}
        </p>
      </section>
    )
  if (!data || data.points.length === 0)
    return (
      <section
        role="status"
        className="flex min-h-[17rem] flex-col justify-center rounded-[var(--shape-16)] border border-border bg-card p-4 text-center shadow-[var(--elevation-card)]"
      >
        <h2 className="m-0 text-lg font-extrabold">Actividad</h2>
        <p className="mt-2 text-muted-foreground">Sin datos de actividad en este periodo.</p>
      </section>
    )

  return (
    <section
      className="min-h-[17rem] min-w-0 rounded-[var(--shape-16)] border border-border bg-card p-4 shadow-[var(--elevation-card)] max-[42rem]:p-4"
      aria-labelledby="dashboard-activity-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="dashboard-activity-title" className="m-0 text-lg font-extrabold">
            Actividad
          </h2>
          <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
            {summary}
          </p>
        </div>
        <label
          className="flex min-h-11 items-center gap-2 text-sm font-bold"
          htmlFor="dashboard-activity-metric"
        >
          <span>Métrica</span>
          <select
            id="dashboard-activity-metric"
            value={metric}
            onChange={(event) => setMetric(event.target.value as ActivityMetric)}
            className="min-h-11 rounded-[var(--shape-8)] border border-border bg-muted px-3 text-foreground outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
          >
            {metricOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        className="mt-3 h-36 max-[42rem]:h-32"
        role="img"
        aria-label={`${metricLabel}: ${summary}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data.points.map((point) => ({ date: point.start, value: point.metrics[metric] }))}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="dashboardActivityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('es', { day: 'numeric', month: 'short' })
              }
              tick={{ fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              labelFormatter={(value) =>
                new Date(value).toLocaleDateString('es', { dateStyle: 'medium' })
              }
              formatter={(value) => [formatNumber(Number(value)), metricLabel]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-primary)"
              strokeWidth={3}
              fill="url(#dashboardActivityFill)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>{metricLabel} por punto temporal</caption>
        <thead>
          <tr>
            <th scope="col">Inicio</th>
            <th scope="col">Valor</th>
          </tr>
        </thead>
        <tbody>
          {data.points.map((point) => (
            <tr key={point.start}>
              <td>{point.start}</td>
              <td>{point.metrics[metric]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
