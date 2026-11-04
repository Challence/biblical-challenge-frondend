import { useState } from 'react'
import type { AnalyticsRanking, AnalyticsRankings } from '../models/analyticsModels'
import { DashboardAnalyticsState } from './DashboardAnalyticsState'

export type DashboardRankingCardProps = {
  title: string
  items: AnalyticsRanking[]
  compact?: boolean
}

export function DashboardPopularityPanel({
  rankings,
  status,
  permissionDenied,
}: {
  rankings: AnalyticsRankings
  status?: 'loading' | 'error' | 'empty' | 'partial' | 'success'
  permissionDenied?: boolean
}) {
  const tabs = [
    ['Lecturas', rankings.segmentsCompleted],
    ['Videos', rankings.videos],
    ['Recursos', rankings.resources],
    ['Anuncios', rankings.announcements],
  ] as const
  const [selected, setSelected] = useState(0)
  const items = tabs[selected][1]
  return (
    <article
      className="flex h-[17rem] min-h-0 min-w-0 flex-col overflow-hidden rounded-[var(--shape-16)] border border-border bg-card p-4 shadow-[var(--elevation-card)] max-[42rem]:p-4"
      aria-labelledby="dashboard-popularity-title"
    >
      <h2 id="dashboard-popularity-title" className="m-0 font-heading text-base font-bold">
        Contenido más popular
      </h2>
      {status && status !== 'empty' ? (
        <DashboardAnalyticsState
          status={status}
          permissionDenied={permissionDenied}
          label="los rankings"
        />
      ) : null}
      <div
        className="mt-4 grid grid-cols-4 overflow-hidden rounded-[var(--shape-8)] border border-border"
        role="tablist"
      >
        {tabs.map(([label], index) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={selected === index}
            onClick={() => setSelected(index)}
            className={`min-h-10 px-2 text-sm font-bold ${selected === index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>
      {items.length ? (
        <div
          tabIndex={0}
          aria-label="Listado de contenido popular"
          className="mt-3 min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="py-2">#</th>
                <th>Título</th>
                <th className="text-right">Interacciones</th>
              </tr>
            </thead>
            <tbody>
              {items.slice(0, 5).map((item, index) => (
                <tr
                  key={`${item.id ?? 'unknown'}-${index}`}
                  className="border-b border-border last:border-0"
                >
                  <td className="py-3 font-bold">{index + 1}</td>
                  <td className="max-w-0 truncate py-3">
                    {item.title ?? item.id ?? 'Sin identificar'}
                  </td>
                  <td className="py-3 text-right font-bold">{item.total.toLocaleString('es')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          Sin datos para este tipo de contenido en el periodo.
        </p>
      )}
    </article>
  )
}

export function DashboardRankingCard({ title, items, compact = false }: DashboardRankingCardProps) {
  return (
    <article
      className={
        compact
          ? 'min-w-0 border-b border-border pb-3 last:border-0 last:pb-0'
          : 'flex h-[11.25rem] min-h-0 min-w-0 flex-col overflow-hidden rounded-[var(--shape-16)] border border-border bg-card p-4 shadow-[var(--elevation-card)] max-[42rem]:p-4'
      }
      aria-label={title}
    >
      <h2 className="m-0 font-heading text-sm font-bold text-muted-foreground">{title}</h2>
      {items.length ? (
        <ol
          tabIndex={0}
          aria-label={`${title}: listado`}
          className="mt-3 min-h-0 min-w-0 flex-1 space-y-2 overflow-x-hidden overflow-y-auto [scrollbar-color:var(--color-border)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border"
        >
          {items.map((item, index) => (
            <li className="flex justify-between gap-4" key={`${item.id ?? 'unknown'}-${index}`}>
              <span className="truncate">{item.title ?? item.id ?? 'Sin identificar'}</span>
              <strong aria-label={`${item.total} resultados`}>{item.total}</strong>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 mb-0 text-[0.8125rem] text-muted-foreground" role="status">
          Sin datos en el periodo.
        </p>
      )}
    </article>
  )
}
