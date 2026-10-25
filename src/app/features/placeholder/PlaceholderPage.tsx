import { tv } from '@/app/shared/lib/tv'

const placeholderStyles = tv({
  slots: {
    page: 'grid max-w-3xl gap-4',
    eyebrow: 'm-0 text-[0.8rem] font-extrabold uppercase tracking-[0.08em] text-primary',
    title: 'm-0 text-[clamp(2rem,5vw,3rem)] leading-[1.1] text-foreground',
    description: 'm-0 text-[1.05rem] text-muted-foreground',
    notice: 'rounded-2xl border border-border bg-card p-4 px-5 text-muted-foreground',
  },
})

const pages = {
  dashboard: ['Resumen general', 'Consulta el estado de tu contenido y tus métricas principales.'],
  segmentos: ['Segmentos', 'Organiza y consulta los segmentos de Palabra Viva.'],
  usuarios: ['Usuarios', 'Gestiona las personas que colaboran en tu espacio.'],
  reportes: ['Reportes', 'Revisa los reportes y la actividad de tu organización.'],
  configuracion: ['Configuración', 'Ajusta las preferencias de tu espacio de trabajo.'],
} as const

export function PlaceholderPage({ segment }: { segment: keyof typeof pages }) {
  const [title, description] = pages[segment]
  const styles = placeholderStyles()
  return <section className={styles.page()} aria-labelledby="page-title"><p className={styles.eyebrow()}>Palabra Viva</p><h1 className={styles.title()} id="page-title">{title}</h1><p className={styles.description()}>{description}</p><div className={styles.notice()}>Este espacio estará disponible próximamente.</div></section>
}
