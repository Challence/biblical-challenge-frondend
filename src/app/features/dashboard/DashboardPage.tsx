import { IconChevronDown, IconTrendingUp } from '@tabler/icons-react'
import { tv } from '@/app/shared/lib/tv'

const dashboardStyles = tv({
  slots: {
    dashboard: 'mx-auto max-w-[76rem]',
    heading: 'mb-8 flex items-end justify-between gap-6 max-[42rem]:mb-6 max-[42rem]:items-start max-[42rem]:flex-col',
    eyebrow: 'mb-1 mt-0 text-xs font-extrabold uppercase tracking-[0.12em] text-primary',
    title: 'm-0 font-[Merriweather,Georgia,serif] text-[clamp(2rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.04em] text-foreground',
    subtitle: 'mt-2 mb-0 text-muted-foreground',
    mockNotice: 'mt-3 mb-0 text-[0.8125rem] font-bold text-primary',
    periodButton: 'inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-[var(--shape-8)] border border-border bg-muted px-3.5 py-2 font-bold text-muted-foreground opacity-80 max-[42rem]:w-full max-[42rem]:justify-between',
    metrics: 'grid grid-cols-2 gap-5 max-[42rem]:grid-cols-1 max-[42rem]:gap-4',
    card: 'min-w-0 rounded-[var(--shape-16)] border border-border bg-card p-6 shadow-[var(--elevation-card)] max-[42rem]:p-5',
    cardHeader: 'flex items-center justify-between gap-4 [&>h2]:m-0 [&>h2]:font-[Merriweather,Georgia,serif] [&>h2]:text-[0.9375rem] [&>h2]:font-bold [&>h2]:text-muted-foreground',
    iconBlock: 'grid size-11 shrink-0 place-items-center rounded-[var(--shape-8)] bg-secondary text-accent',
    valueRow: 'mt-3 flex items-baseline justify-between gap-4',
    value: 'font-[Merriweather,Georgia,serif] text-4xl tracking-[-0.04em] text-foreground',
    change: 'inline-flex items-center gap-[0.2rem] text-[0.8125rem] font-extrabold text-primary',
    chart: 'mt-6 flex h-20 items-end gap-2 border-b border-border pt-1',
    bar: 'h-[var(--bar-height)] min-w-[0.4rem] flex-1 rounded-t text-primary opacity-80 even:bg-secondary last:bg-accent last:opacity-100',
    summary: 'mt-3 mb-0 text-[0.8125rem] text-muted-foreground',
  },
})

type Metric = {
  label: string
  value: string
  change: string
  bars: number[]
  summary: string
}

const metrics: Metric[] = [
  { label: 'Personas que entraron', value: '1,284', change: '+12.5%', bars: [38, 54, 43, 68, 58, 76, 88], summary: 'Tendencia ascendente, con el valor más alto al final del periodo.' },
  { label: 'Lecturas completadas', value: '864', change: '+8.2%', bars: [42, 61, 52, 48, 70, 64, 82], summary: 'Crecimiento sostenido y una mejora notable en los últimos días.' },
  { label: 'Compartidos', value: '326', change: '+15.8%', bars: [28, 46, 39, 57, 44, 69, 78], summary: 'Los compartidos aumentaron progresivamente durante el periodo.' },
  { label: 'Visualizaciones de videos', value: '2,491', change: '+21.4%', bars: [35, 41, 63, 55, 72, 81, 94], summary: 'Las visualizaciones alcanzaron su máximo al cierre del periodo.' },
]

export function DashboardPage() {
  const styles = dashboardStyles()
  return (
    <section className={styles.dashboard()} aria-labelledby="dashboard-title">
      <div className={styles.heading()}>
        <div>
          <p className={styles.eyebrow()}>Resumen general</p>
          <h1 className={styles.title()} id="dashboard-title">Dashboard</h1>
          <p className={styles.subtitle()}>Una mirada clara al impacto de tu contenido.</p>
          <p className={styles.mockNotice()}>Datos demostrativos (mock): todos los valores de este dashboard son de ejemplo.</p>
        </div>
        <button type="button" className={styles.periodButton()} aria-label="Periodo mostrado: últimos 7 días" disabled>
          Últimos 7 días <IconChevronDown size={18} aria-hidden="true" />
        </button>
      </div>
      <div className={styles.metrics()}>
        {metrics.map((metric) => (
          <article className={styles.card()} key={metric.label}>
            <div className={styles.cardHeader()}><h2>{metric.label}</h2><span className={styles.iconBlock()}><IconTrendingUp size={21} aria-hidden="true" /></span></div>
            <div className={styles.valueRow()}><strong className={styles.value()}>{metric.value}</strong><span className={styles.change()}><IconTrendingUp size={14} aria-hidden="true" /> {metric.change}</span></div>
            <div className={styles.chart()} role="img" aria-label={`${metric.label}: ${metric.summary}`}>
              {metric.bars.map((height, index) => <span className={styles.bar()} style={{ '--bar-height': `${height}%` } as React.CSSProperties} key={`${metric.label}-${index}`} aria-hidden="true" />)}
            </div>
            <p className={styles.summary()}>{metric.summary}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
