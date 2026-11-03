import { IconCalendar, IconChevronRight } from '@tabler/icons-react'
import { NavLink } from 'react-router-dom'
import { Card } from '@/app/shared/components/ui/card'

export function PublicReadingGuideSection() {
  return (
    <Card className="h-24 overflow-hidden border-primary bg-gradient-to-br from-primary via-primary to-primary/80 text-white sm:h-28">
      <NavLink
        to="/guia"
        className="group flex size-full items-center gap-4 rounded-[inherit] px-4 py-3 text-white no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white sm:gap-6 sm:px-8"
        aria-labelledby="reading-guide-card-title"
        aria-describedby="reading-guide-card-description"
      >
        <IconCalendar
          aria-hidden="true"
          className="size-9 shrink-0 -rotate-6 transition-transform group-hover:-rotate-3 sm:size-12"
          stroke={1.7}
        />
        <div className="min-w-0">
          <h2
            id="reading-guide-card-title"
            className="font-heading text-lg font-bold leading-tight sm:text-xl"
          >
            Guía de lectura
          </h2>
          <p
            id="reading-guide-card-description"
            className="mt-1 text-xs leading-snug text-white/90 sm:mt-2 sm:text-base"
          >
            Descubre la guía de lectura y acompaña tu reflexión diaria.
          </p>
        </div>
        <span
          className="ml-auto flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        >
          <IconChevronRight size={24} stroke={2} />
        </span>
      </NavLink>
    </Card>
  )
}
