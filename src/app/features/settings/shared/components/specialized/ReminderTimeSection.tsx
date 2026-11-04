import { useEffect, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/app/shared/components/ui/button'
import { Card } from '@/app/shared/components/ui/card'
import { RhfTextField } from '@/app/shared/components/fields/rhf/RhfTextField'
import {
  getPushReminderSettings,
  savePushReminderSettings,
} from '../../../requests/pushReminderSettingsRequests'

const schema = z.object({
  reminderTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, 'Selecciona una hora válida.'),
})
type FormValues = z.infer<typeof schema>

export function ReminderTimeSection() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reminderTime: '' },
  })
  const { handleSubmit, reset, formState } = methods

  useEffect(() => {
    let mounted = true
    void getPushReminderSettings()
      .then(({ reminder_time }) => {
        if (mounted) reset({ reminderTime: reminder_time })
      })
      .catch((cause: unknown) => {
        if (mounted)
          setError(cause instanceof Error ? cause.message : 'No se pudo consultar la hora.')
      })
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [reset])

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, [])
  const submit = handleSubmit(async ({ reminderTime }) => {
    setError('')
    setSuccess('')
    try {
      const response = await savePushReminderSettings(reminderTime)
      reset({ reminderTime: response.reminder_time })
      setSuccess('Hora del recordatorio guardada correctamente.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la hora.')
    }
  })

  return (
    <section aria-labelledby="reminder-time-title">
      <h2 id="reminder-time-title" className="mb-3 font-heading text-xl font-bold">
        Hora de recordatorios
      </h2>
      <Card className="p-4 sm:p-5">
        <p className="mb-4 text-sm text-muted-foreground">
          Elige la hora local a la que se enviarán los recordatorios. Zona horaria detectada:{' '}
          {timezone}.
        </p>
        <FormProvider {...methods}>
          <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="w-full sm:max-w-xs">
              <RhfTextField<FormValues>
                id="reminder-time"
                name="reminderTime"
                label="Hora de envío"
                type="time"
                step={60}
                required
                disabled={loading || formState.isSubmitting}
                helperText="La hora se interpreta según tu zona horaria local."
                className="relative pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2"
                onClick={(event) => {
                  try {
                    event.currentTarget.showPicker?.()
                  } catch {
                    // Algunos navegadores exponen showPicker pero no permiten invocarlo.
                  }
                }}
              />

              <Button type="submit" disabled={loading || formState.isSubmitting} className="mt-3">
                {formState.isSubmitting ? 'Guardando…' : 'Guardar hora'}
              </Button>
            </div>
          </form>
        </FormProvider>
        <div className="mt-3 text-sm" aria-live="polite">
          {loading && (
            <span className="text-muted-foreground">Consultando la hora configurada…</span>
          )}
          {success && <span className="text-green-700">{success}</span>}
        </div>
        {error && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </Card>
    </section>
  )
}
