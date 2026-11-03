import readingEmptyState from '@/assets/reading-empty-state.webp'
import { cn } from '@/app/shared/lib/utils'

export type EmptyProps = {
  size?: 'sm' | 'md' | 'lg'
  msg: string
  className?: string
}

const imageSizes = {
  sm: 'h-24 w-36',
  md: 'h-32 w-48',
  lg: 'h-48 w-72',
} as const

export function Empty({ size = 'md', msg, className }: EmptyProps) {
  return (
    <section
      className={cn('flex flex-col items-center justify-center text-center', className)}
      aria-label={msg}
    >
      <img
        src={readingEmptyState}
        alt="Ilustración de una Biblia con una lupa y un signo de interrogación"
        className={cn('object-contain', imageSizes[size])}
      />
      <p className="m-0 font-normal">{msg}</p>
    </section>
  )
}
