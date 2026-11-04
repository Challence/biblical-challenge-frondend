import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react'
import type { ComponentType } from 'react'
import type { AnalyticsMetric } from '../models/analyticsModels'

export type DashboardMetricCardProps = {
  label: string
  description: string
  metric: keyof AnalyticsMetric
  current: AnalyticsMetric
  previous: AnalyticsMetric
  icon?: ComponentType<{ size?: number }>
}

export function DashboardMetricCard({
  label,
  description,
  metric,
  current,
  previous,
  icon: MetricIcon = IconTrendingUp,
}: DashboardMetricCardProps) {
  const value = current[metric]
  const difference = value - previous[metric]
  const percentage =
    previous[metric] === 0 ? (value === 0 ? 0 : 100) : (difference / previous[metric]) * 100
  const comparison =
    percentage === 0
      ? 'Sin cambio frente al periodo anterior'
      : `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}% frente al periodo anterior`

  return (
    <article
      className="flex min-h-[8rem] min-w-0 flex-col rounded-[var(--shape-16)] border border-border bg-card p-3 shadow-[var(--elevation-card)] max-[42rem]:min-h-0 max-[42rem]:p-4"
      aria-label={label}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span
            className="grid size-8 shrink-0 place-items-center rounded-[var(--shape-8)] bg-secondary text-accent"
            aria-hidden="true"
          >
            <MetricIcon size={16} />
          </span>
          <h2 className="m-0 font-heading text-xs font-bold leading-snug text-muted-foreground">
            {label}
          </h2>
        </div>
      </div>
      <div className="mt-auto flex items-end justify-between gap-2 pt-2">
        <strong className="font-heading text-2xl tracking-[-0.04em] text-foreground">
          {value}
        </strong>
        <span
          className={`inline-flex items-center text-xs font-bold ${difference < 0 ? 'text-destructive' : 'text-success'}`}
          aria-label={comparison}
        >
          {difference < 0 ? <IconTrendingDown size={14} /> : <IconTrendingUp size={14} />}{' '}
          {percentage === 0 ? '0%' : `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`}
          <span className="sr-only">{comparison}</span>
        </span>
      </div>
      <div className="mt-2 flex h-4 items-end gap-1" aria-hidden="true">
        <span className="h-1.5 w-1/4 rounded-sm bg-primary/20" />
        <span className="h-2.5 w-1/4 rounded-sm bg-primary/40" />
        <span className="h-3.5 w-1/4 rounded-sm bg-primary/60" />
        <span
          className={`h-4 w-1/4 rounded-sm ${difference < 0 ? 'bg-destructive/60' : 'bg-primary'}`}
        />
      </div>
      <p className="sr-only">{description}</p>
    </article>
  )
}
