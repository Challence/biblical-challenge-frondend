import { IconChartBar } from '@tabler/icons-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { AnalyticsAudienceDistribution } from '../models/analyticsModels'

export type DashboardAudienceCardProps = { data: AnalyticsAudienceDistribution }

export function DashboardAudienceCard({ data }: DashboardAudienceCardProps) {
  const rows = [
    ['Android', data.platform.android],
    ['iOS', data.platform.ios],
    ['Otros', data.platform.other],
    ['Aplicación instalada', data.displayMode.standalone],
    ['Navegador', data.displayMode.browser],
  ] as const
  const chartData = rows.slice(0, 3).map(([name, bucket]) => ({ name, value: bucket.total }))

  return (
    <article className="h-full min-h-[11.25rem] min-w-0 rounded-[var(--shape-16)] border border-border bg-card p-4 shadow-[var(--elevation-card)] max-[42rem]:p-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="m-0 font-heading text-[0.9375rem] font-bold text-muted-foreground">
          Distribución de audiencia
        </h2>
        <span
          className="grid size-11 shrink-0 place-items-center rounded-[var(--shape-8)] bg-secondary text-accent"
          aria-hidden="true"
        >
          <IconChartBar size={21} />
        </span>
      </div>
      <p className="mt-2 mb-0 text-xs text-muted-foreground">Total: {data.total}</p>
      <div className="mt-1 flex items-center gap-3">
        {data.total > 0 ? (
          <div className="h-20 w-24 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="78%"
                  paddingAngle={2}
                >
                  <Cell fill="var(--color-primary)" />
                  <Cell fill="var(--color-accent)" />
                  <Cell fill="var(--color-secondary)" />
                </Pie>
                <Tooltip formatter={(value) => [value, 'usuarios']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : null}
        <dl className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] text-xs">
          {rows.map(([name, bucket]) => (
            <div className="contents" key={name}>
              <dt className="truncate">{name}</dt>
              <dd className="m-0 pl-4 text-right font-bold">
                {bucket.total} ({bucket.percentage}%)
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <p className="mt-1 mb-0 text-xs text-muted-foreground">
        Ubicación no disponible en este momento.
      </p>
    </article>
  )
}
