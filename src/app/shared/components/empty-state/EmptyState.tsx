import { IconSearchOff } from '@tabler/icons-react'
import type { Icon } from '@tabler/icons-react'
import { useId } from 'react'

import { cn } from '@/app/shared/lib/utils'

export type EmptyStateProps = {
  title: string
  description?: string
  className?: string
  icon?: Icon
  iconClassName?: string
  illustrationSrc?: string
  illustrationAlt?: string
  illustrationClassName?: string
  titleClassName?: string
}

/** Presenta un mensaje claro cuando una colección o sección no tiene contenido. */
export function EmptyState({
  title,
  description,
  className,
  icon: IconComponent = IconSearchOff,
  iconClassName = 'text-muted-foreground',
  illustrationSrc,
  illustrationAlt = '',
  illustrationClassName,
  titleClassName,
}: EmptyStateProps) {
  const id = useId()
  const titleId = `${id}-title`
  const descriptionId = `${id}-description`

  return (
    <section
      className={cn(
        'flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-6 py-10 text-center',
        className,
      )}
      aria-labelledby={titleId}
      {...(description ? { 'aria-describedby': descriptionId } : {})}
    >
      {illustrationSrc ? (
        <img
          src={illustrationSrc}
          alt={illustrationAlt}
          className={cn('mb-4 h-32 w-48 object-contain', illustrationClassName)}
        />
      ) : (
        <IconComponent className={cn('mb-4 h-10 w-10', iconClassName)} aria-hidden="true" />
      )}
      <h2 id={titleId} className={cn('m-0 text-lg font-semibold', titleClassName)}>
        {title}
      </h2>
      {description ? (
        <p id={descriptionId} className="mt-2 mb-0 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
    </section>
  )
}
