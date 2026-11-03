import type { ReactNode } from 'react'

type AdminPageHeaderProps = {
  title: string
  titleId?: string
  description?: string
  action?: ReactNode
}

/** Encabezado compuesto para páginas administrativas, sin asumir acciones ni navegación. */
export function AdminPageHeader({ title, titleId, description, action }: AdminPageHeaderProps) {
  return (
    <header className="mb-8 flex items-end justify-between gap-6 max-[42rem]:mb-6 max-[42rem]:items-start max-[42rem]:flex-col">
      <div className="min-w-0 space-y-2">
        <h1
          id={titleId}
          className="m-0 font-heading text-[clamp(2rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.04em]"
        >
          {title}
        </h1>
        {description ? <p className="m-0 text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0 max-[42rem]:w-full">{action}</div> : null}
    </header>
  )
}
