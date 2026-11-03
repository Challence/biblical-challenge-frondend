import { Outlet, useMatches } from 'react-router-dom'

type SegmentRouteHandle = { segmentTitle?: string }

export function SegmentAdminLayout() {
  const matches = useMatches()
  const match = [...matches]
    .reverse()
    .find((item) => (item.handle as SegmentRouteHandle | undefined)?.segmentTitle)
  const title = (match?.handle as SegmentRouteHandle | undefined)?.segmentTitle ?? 'Segmento'
  return (
    <section className="mx-auto max-w-[76rem]" aria-labelledby="segment-form-title">
      <h1
        id="segment-form-title"
        className="mb-5 font-heading text-[clamp(1.75rem,3.5vw,2.25rem)] leading-tight tracking-[-0.04em]"
      >
        {title}
      </h1>
      <Outlet />
    </section>
  )
}
