import { useEffect, useId, useRef, useState } from 'react'
import { IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { Button } from '@/app/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'
import { Label } from '@/app/shared/components/ui/label'
import { cn } from '@/app/shared/lib/utils'

const PAGE_SIZE = 12

export interface YearFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  min: number
  max: number
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string | boolean
  helperText?: string
}

export function YearField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  placeholder = 'Selecciona un año',
  required,
  disabled,
  error,
  helperText,
}: YearFieldProps) {
  const labelId = `${id}-label`
  const dialogTitleId = `${id}-dialog-title`
  const descriptionId = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const selectedYear = Number(value)
  const initialYear =
    Number.isInteger(selectedYear) && selectedYear >= min && selectedYear <= max
      ? selectedYear
      : min
  const [pageStart, setPageStart] = useState(
    min + Math.floor((initialYear - min) / PAGE_SIZE) * PAGE_SIZE,
  )
  const errorMessage = typeof error === 'string' ? error : undefined
  const describedBy = errorMessage ? `${id}-error` : helperText ? descriptionId : undefined
  const pageEnd = Math.min(pageStart + PAGE_SIZE - 1, max)
  const years = Array.from({ length: pageEnd - pageStart + 1 }, (_, index) => pageStart + index)

  useEffect(() => {
    if (!open) return
    const closeTopmostDialog = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopImmediatePropagation()
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('keydown', closeTopmostDialog, true)
    return () => document.removeEventListener('keydown', closeTopmostDialog, true)
  }, [open])

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setPageStart(min + Math.floor((initialYear - min) / PAGE_SIZE) * PAGE_SIZE)
    }
    setOpen(nextOpen)
    if (!nextOpen) triggerRef.current?.focus()
  }

  return (
    <div className="space-y-2">
      <Label id={labelId} htmlFor={id}>
        {label}
        {required ? ' *' : ''}
      </Label>
      <Button
        ref={triggerRef}
        id={id}
        type="button"
        variant="outline"
        disabled={disabled}
        aria-labelledby={`${labelId} ${id}-value`}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error) || undefined}
        aria-required={required || undefined}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => handleOpenChange(true)}
        className={cn(
          'h-11 w-full justify-between px-3 font-normal',
          !value && 'text-muted-foreground',
          error && 'border-destructive',
        )}
      >
        <span id={`${id}-value`}>{value || placeholder}</span>
        <IconCalendar aria-hidden="true" />
      </Button>
      {errorMessage ? (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : helperText ? (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      ) : null}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          aria-labelledby={dialogTitleId}
          className="max-h-[calc(100dvh-1.5rem)] max-w-md overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle id={dialogTitleId}>{label}</DialogTitle>
            <DialogDescription>
              Selecciona un año entre {min} y {max}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between gap-2" aria-live="polite">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Años anteriores"
              disabled={pageStart === min}
              onClick={() => setPageStart(Math.max(min, pageStart - PAGE_SIZE))}
            >
              <IconChevronLeft aria-hidden="true" />
            </Button>
            <p className="text-sm font-medium">
              {pageStart}–{pageEnd}
            </p>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Años siguientes"
              disabled={pageEnd === max}
              onClick={() => setPageStart(pageStart + PAGE_SIZE)}
            >
              <IconChevronRight aria-hidden="true" />
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Años disponibles">
            {years.map((year, index) => (
              <Button
                key={year}
                type="button"
                variant={String(year) === value ? 'default' : 'outline'}
                aria-pressed={String(year) === value}
                data-autofocus={index === 0 ? '' : undefined}
                onClick={() => {
                  onChange(String(year))
                  handleOpenChange(false)
                }}
                className="h-11"
              >
                {year}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
