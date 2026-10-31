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
  const [pendingMonth, setPendingMonth] = useState<string | null>(null)
  const year = new Date().getFullYear()

  const applyMonth = (nextMonth: string) => {
    const monthIndex = SEGMENT_MONTHS.indexOf(nextMonth as (typeof SEGMENT_MONTHS)[number])
    const maximumDay = new Date(year, monthIndex + 1, 0).getDate()
    setValue('month', nextMonth, { shouldDirty: true, shouldValidate: true })
    setValue(
      'days',
      days.filter(({ day }) => day <= maximumDay),
      { shouldDirty: true, shouldValidate: true },
    )
    setPendingMonth(null)
  }

  const requestMonthChange = (nextMonth: string) => {
    if (!nextMonth || nextMonth === month) return
    if (days.length === 0) {
      applyMonth(nextMonth)
      return
    }
    setPendingMonth(nextMonth)
  }

  const pendingMonthIndex = SEGMENT_MONTHS.indexOf(pendingMonth as (typeof SEGMENT_MONTHS)[number])
  const maximumPendingDay =
    pendingMonthIndex >= 0 ? new Date(year, pendingMonthIndex + 1, 0).getDate() : 31
  const removedDays = days.filter(({ day }) => day > maximumPendingDay).map(({ day }) => day)

  return (
    <>
      <SegmentInformationCard onMonthChange={requestMonthChange} />
      <SegmentCalendarCard onMonthChange={requestMonthChange} />
      <Dialog open={pendingMonth !== null} onOpenChange={(open) => !open && setPendingMonth(null)}>
        <DialogContent
          aria-labelledby="segment-month-change-title"
          aria-describedby="segment-month-change-description"
        >
          <DialogHeader>
            <DialogTitle id="segment-month-change-title">Cambiar mes del segmento</DialogTitle>
            <DialogDescription id="segment-month-change-description">
              El calendario cambiará a {pendingMonth}. Los días configurados que sean válidos se
              conservarán.
            </DialogDescription>
          </DialogHeader>
          {removedDays.length > 0 && (
            <p className="text-sm text-destructive">
              Se eliminarán los días que no existen en {pendingMonth}: {removedDays.join(', ')}.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setPendingMonth(null)}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => pendingMonth && applyMonth(pendingMonth)}>
              Confirmar cambio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
