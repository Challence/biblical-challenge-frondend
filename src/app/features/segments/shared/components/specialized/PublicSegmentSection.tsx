import { IconCalendarMonth } from '@tabler/icons-react'

import { Empty } from '@/app/shared/components/empty/Empty'

import { usePublicSegments } from '../../../hooks/usePublicSegments'
import { PublicSegmentList } from './PublicSegmentList'

export function PublicSegmentSection() {
  const { data, isLoading, isError } = usePublicSegments()

  return (
    <section aria-labelledby="public-segments-title">
      <h2
        id="public-segments-title"
        className="flex items-center gap-2 font-heading text-xl font-semibold tracking-[-0.03em] text-primary sm:text-2xl"
      >
        <IconCalendarMonth className="size-6 shrink-0" aria-hidden="true" />
        <span>Lectura por mes</span>
      </h2>
      <p className="mt-2 text-muted-foreground">Explora las lecturas disponibles para cada mes.</p>
      {isLoading && (
        <p className="mt-6" aria-live="polite">
          Cargando lecturas…
        </p>
      )}
      {isError && (
        <p className="mt-6 text-destructive" role="alert">
          No se pudieron cargar las lecturas.
        </p>
      )}
      {!isLoading && !isError && !data?.length ? (
        <Empty size="md" msg="No hay set de lecturas" className="mt-6 py-6" />
      ) : null}
      {!isLoading && !isError && data?.length ? <PublicSegmentList segments={data} /> : null}
    </section>
  )
}
