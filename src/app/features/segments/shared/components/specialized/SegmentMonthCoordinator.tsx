import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Button } from '@/app/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'
import type { SegmentFormValues } from '../../../models/segmentFormSchema'
import { SEGMENT_MONTHS } from '../../../models/segmentCatalog'
import { SegmentCalendarCard } from './SegmentCalendarCard'
import { SegmentInformationCard } from './SegmentInformationCard'

export function SegmentMonthCoordinator() {
  const { control, setValue } = useFormContext<SegmentFormValues>()
  const days = useWatch({ control, name: 'days' })
  const month = useWatch({ control, name: 'month' })
  const year = useWatch({ control, name: 'year' })
  const [pending, setPending] = useState<{ month: string; year: number } | null>(null)

  const applyChange = (nextMonth: string, nextYear: number) => {
    const monthIndex = SEGMENT_MONTHS.indexOf(nextMonth as (typeof SEGMENT_MONTHS)[number])
    const maximumDay = new Date(nextYear, monthIndex + 1, 0).getDate()
    setValue('month', nextMonth, { shouldDirty: true, shouldValidate: true })
    setValue('year', nextYear, { shouldDirty: true, shouldValidate: true })
    setValue(
      'days',
      days.filter(({ day }) => day <= maximumDay),
      { shouldDirty: true, shouldValidate: true },
    )
    setPending(null)
  }

  const requestMonthChange = (nextMonth: string) => {
    if (!nextMonth || nextMonth === month) return
    if (days.length === 0) {
      applyChange(nextMonth, year)
      return
    }
    setPending({ month: nextMonth, year })
  }
  const requestYearChange = (nextYear: number) => {
    if (!nextYear || nextYear === year) return
    if (days.length === 0) return applyChange(month, nextYear)
    setPending({ month, year: nextYear })
  }

  const pendingMonthIndex = SEGMENT_MONTHS.indexOf(
    pending?.month as (typeof SEGMENT_MONTHS)[number],
  )
  const maximumPendingDay =
    pendingMonthIndex >= 0 && pending
      ? new Date(pending.year, pendingMonthIndex + 1, 0).getDate()
      : 31
  const removedDays = days.filter(({ day }) => day > maximumPendingDay).map(({ day }) => day)

  return (
    <>
      <SegmentInformationCard onMonthChange={requestMonthChange} onYearChange={requestYearChange} />
      <SegmentCalendarCard onMonthChange={requestMonthChange} />
      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent
          aria-labelledby="segment-month-change-title"
          aria-describedby="segment-month-change-description"
        >
          <DialogHeader>
            <DialogTitle id="segment-month-change-title">
              Cambiar calendario del segmento
            </DialogTitle>
            <DialogDescription id="segment-month-change-description">
              El calendario cambiará a {pending?.month} {pending?.year}. Los días configurados que
              sean válidos se conservarán.
            </DialogDescription>
          </DialogHeader>
          {removedDays.length > 0 && (
            <p className="text-sm text-destructive">
              Se eliminarán los días que no existen en {pending?.month}: {removedDays.join(', ')}.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setPending(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() => pending && applyChange(pending.month, pending.year)}
            >
              Confirmar cambio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
