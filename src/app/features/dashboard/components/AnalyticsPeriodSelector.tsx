import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { AnalyticsPeriod, AnalyticsPeriodQuery } from '../models/analyticsModels'

const periods: Array<{ value: AnalyticsPeriod; label: string }> = [
  { value: 'day', label: 'Día' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mes' },
  { value: 'year', label: 'Año' },
]

const periodNames: Record<AnalyticsPeriod, string> = {
  day: 'día',
  week: 'semana',
  month: 'mes',
  year: 'año',
}

function shift(reference: string, period: AnalyticsPeriod, direction: -1 | 1) {
  const date = new Date(reference)
  if (period === 'day') date.setUTCDate(date.getUTCDate() + direction)
  if (period === 'week') date.setUTCDate(date.getUTCDate() + direction * 7)
  if (period === 'month') date.setUTCMonth(date.getUTCMonth() + direction)
  if (period === 'year') date.setUTCFullYear(date.getUTCFullYear() + direction)
  return date
}

function validReference(value: string | null, fallback: string) {
  if (!value) return fallback
  const date = new Date(value)
  return Number.isNaN(date.valueOf()) || date > new Date(fallback) ? fallback : date.toISOString()
}

export function useAnalyticsPeriodSelector(timezone = 'UTC') {
  const [params, setParams] = useSearchParams()
  const [defaultReference] = useState(() => new Date().toISOString())
  const period = periods.some((item) => item.value === params.get('period'))
    ? (params.get('period') as AnalyticsPeriod)
    : 'week'
  const referenceParam = params.get('reference')
  const reference = validReference(referenceParam, defaultReference)
  const query = useMemo<AnalyticsPeriodQuery>(
    () => ({ period, reference, timezone }),
    [period, reference, timezone],
  )

  useEffect(() => {
    if (referenceParam === reference) return
    setParams(
      (current) => {
        if (current.get('reference') !== referenceParam) return current
        const result = new URLSearchParams(current)
        result.set('reference', reference)
        return result
      },
      { replace: true },
    )
  }, [reference, referenceParam, setParams])

  const update = useCallback(
    (next: Partial<AnalyticsPeriodQuery>) => {
      setParams((current) => {
        const result = new URLSearchParams(current)
        if (next.period) result.set('period', next.period)
        if (next.reference) result.set('reference', next.reference)
        return result
      })
    },
    [setParams],
  )

  const navigate = useCallback(
    (direction: -1 | 1) => {
      const next = shift(reference, period, direction)
      if (direction > 0 && next > new Date()) return
      update({ reference: next.toISOString() })
    },
    [period, reference, update],
  )

  return {
    query,
    setPeriod: (next: AnalyticsPeriod) => update({ period: next }),
    previous: () => navigate(-1),
    next: () => navigate(1),
    canGoNext: shift(reference, period, 1) <= new Date(),
  }
}

export function AnalyticsPeriodSelector({ timezone = 'UTC' }: { timezone?: string }) {
  const { query, setPeriod, previous, next, canGoNext } = useAnalyticsPeriodSelector(timezone)
  const formattedDate = new Intl.DateTimeFormat('es', {
    dateStyle: 'medium',
    timeZone: query.timezone,
  }).format(new Date(query.reference))
  const currentLabel = `${periodNames[query.period]} de referencia ${formattedDate}`
  const previousLabel = `${periodNames[query.period]} anterior`
  return (
    <div
      className="flex min-w-0 flex-wrap items-center gap-2"
      aria-label="Selector de periodo analítico"
    >
      <label className="sr-only" htmlFor="analytics-period">
        Periodo analítico
      </label>
      <select
        id="analytics-period"
        value={query.period}
        onChange={(event) => setPeriod(event.target.value as AnalyticsPeriod)}
        className="min-h-11 rounded-[var(--shape-8)] border border-border bg-muted px-3 font-bold text-foreground outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
      >
        {periods.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={previous}
        className="grid min-h-11 min-w-11 place-items-center rounded-[var(--shape-8)] border border-border focus-visible:outline-2 focus-visible:outline-primary"
        aria-label={`Ir al ${previousLabel}`}
      >
        <IconChevronLeft aria-hidden="true" />
      </button>
      <span
        className="min-w-0 truncate text-sm font-bold text-muted-foreground"
        aria-live="polite"
        aria-label={`Rango actual: ${currentLabel}`}
      >
        {formattedDate}
      </span>
      <button
        type="button"
        onClick={next}
        disabled={!canGoNext}
        className="grid min-h-11 min-w-11 place-items-center rounded-[var(--shape-8)] border border-border disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary"
        aria-label="Ir al periodo siguiente"
      >
        <IconChevronRight aria-hidden="true" />
      </button>
    </div>
  )
}
