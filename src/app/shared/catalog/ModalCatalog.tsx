import { useModal } from '@/app/shared/hooks/useModal'

/** Desarrollo: ejemplo del contrato promise-based del modal compartido. */
export function ModalCatalog() {
  const { open } = useModal()

  return (
    <button
      type="button"
      onClick={() =>
        void open({
          data: 'Contenido de ejemplo',
          title: 'Modal compartido',
          description: 'El template decide el contenido y las acciones.',
          template: ({ data, confirm, close, dismiss }) => (
            <div className="flex flex-col gap-4">
              <p>{data}</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => confirm('confirmado')}>
                  Confirmar
                </button>
                <button type="button" onClick={close}>
                  Cerrar
                </button>
                <button type="button" onClick={dismiss}>
                  Descartar
                </button>
              </div>
            </div>
          ),
        })
      }
    >
      Abrir modal
    </button>
  )
}
