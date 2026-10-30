import type { ButtonHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import { cn } from '@/app/shared/lib/utils'
import { tv } from '@/app/shared/lib/tv'
import type { VariantProps } from 'tailwind-variants'

const buttonVariants = tv({
  base: 'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
      outline:
        'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      small: 'h-9 min-h-9 rounded-md px-3',
      medium: 'h-10 px-4 py-2',
      large: 'h-11 rounded-md px-8',
      icon: 'size-11',
    },
  },
  defaultVariants: { variant: 'default', size: 'medium' },
})

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
)

Button.displayName = 'Button'
