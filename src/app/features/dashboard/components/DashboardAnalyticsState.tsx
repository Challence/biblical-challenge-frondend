export type DashboardAnalyticsStateProps = {
  status: 'loading' | 'error' | 'empty' | 'partial' | 'success'
  label: string
  permissionDenied?: boolean
}

export function DashboardAnalyticsState({
  status,
  label,
  permissionDenied = false,
}: DashboardAnalyticsStateProps) {
  if (status === 'loading') return <p role="status">Cargando {label}…</p>
  if (status === 'error')
    return (
      <p role="alert">
        {permissionDenied
          ? `No tienes permisos para consultar ${label}.`
          : `No se pudieron cargar ${label}.`}
      </p>
    )
  if (status === 'empty') return <p role="status">No hay datos de {label} en este periodo.</p>
  return null
}
