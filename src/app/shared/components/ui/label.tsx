import * as React from 'react'
import { cn } from '@/app/shared/lib/utils'
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn('text-sm font-semibold leading-none', className)} {...props} />
))
Label.displayName = 'Label'
