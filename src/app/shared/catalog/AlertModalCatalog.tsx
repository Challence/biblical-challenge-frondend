import { useModalAlert } from '@/app/shared/hooks/useModalAlert'

/** Catálogo visual: se renderiza dentro del ModalProvider de la aplicación. */
export function AlertModalCatalog() {
  const { warning, error, success, info } = useModalAlert()
  const alerts = [
    { label: 'Warning', open: warning },
    { label: 'Error', open: error },
    { label: 'Success', open: success },
    { label: 'Info', open: info },
  ] as const

  return (
    <div className="flex flex-wrap gap-2">
      {alerts.map(({ label, open }) => (
        <button
          key={label}
          type="button"
          onClick={() =>
            void open({
              title: `${label} de ejemplo`,
              message: `Este es un modal de alerta de tipo ${label.toLowerCase()}.`,
            })
          }
        >
          Ver {label}
        </button>
      ))}
    </div>
  )
}
