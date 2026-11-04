import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/app/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/app/shared/components/ui/dialog'
import { RhfSelectField } from '@/app/shared/components/fields/rhf/RhfSelectField'
import { RhfYearField } from '@/app/shared/components/fields/rhf/RhfYearField'
import type { ResourceMonth } from '../../../models/resource'
import {
  resourceMonthFormSchema,
  type ResourceMonthFormInput,
  type ResourceMonthFormValues,
} from '../../../models/resourceMonthFormSchema'
import { useEffect } from 'react'

const monthOptions = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1
  return {
    value: String(month).padStart(2, '0'),
    label: new Intl.DateTimeFormat('es', { month: 'long', timeZone: 'UTC' }).format(
      new Date(Date.UTC(2024, index, 1)),
    ),
  }
})

const formValuesFromMonthDate = (monthDate?: string): ResourceMonthFormInput => ({
  month: monthDate?.slice(5, 7) ?? '',
  year: monthDate?.slice(0, 4) ?? '',
})

export function ResourceMonthFormDialog({
  open,
  month,
  pending,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  month?: ResourceMonth
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (values: ResourceMonthFormValues) => void
}) {
  const form = useForm<ResourceMonthFormInput>({
    resolver: zodResolver(resourceMonthFormSchema),
    defaultValues: formValuesFromMonthDate(month?.monthDate),
  })
  useEffect(() => {
    if (open) form.reset(formValuesFromMonthDate(month?.monthDate))
  }, [open, month, form])
  const handleSubmit = (values: ResourceMonthFormInput) =>
    onSubmit({ monthDate: `${values.year}-${values.month}-01` })
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-labelledby="resource-month-dialog-title">
        <DialogHeader>
          <DialogTitle id="resource-month-dialog-title">
            {month ? 'Editar mes' : 'Nuevo mes'}
          </DialogTitle>
          <DialogDescription>Selecciona el mes y el año que quieres organizar.</DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <RhfSelectField
              name="month"
              id="resource-month-month"
              label="Mes"
              options={monthOptions}
              placeholder="Selecciona un mes"
            />
            <RhfYearField
              name="year"
              id="resource-month-year"
              label="Año"
              min={2024}
              max={2031}
              placeholder="Selecciona un año"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending || form.formState.isSubmitting}>
                {pending ? 'Guardando…' : 'Guardar'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
