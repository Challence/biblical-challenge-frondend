import { IconBell } from '@tabler/icons-react'
import { Card } from '@/app/shared/components/ui/card'
import { Switch } from '@/app/shared/components/ui/switch'
import { usePushNotifications } from '@/app/shared/hooks/usePushNotifications'

export function NotificationsSection() {
  const notifications = usePushNotifications()
  const notificationsBusy = ['loading', 'enabling', 'disabling'].includes(notifications.status)
  const notificationsActive = notifications.status === 'active'
  const notificationsDisabled =
    notificationsBusy || ['unsupported', 'denied'].includes(notifications.status)

  return (
    <section aria-labelledby="notifications-title">
      <h2 id="notifications-title" className="mb-3 font-heading text-xl font-bold">
        Notificaciones
      </h2>
      <Card className="flex items-center justify-between gap-4 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <IconBell className="mt-0.5 shrink-0 text-primary" size={22} aria-hidden="true" />
          <div>
            <h3 className="font-semibold">Recordatorios de lectura</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Recibe un recordatorio para mantener tu ritmo diario.
            </p>
          </div>
        </div>
        <Switch
          aria-label="Recordatorios de lectura"
          checked={notificationsActive}
          disabled={notificationsDisabled}
          onCheckedChange={() =>
            void (notificationsActive ? notifications.disable() : notifications.enable())
          }
        />
      </Card>
      <div className="mt-2 text-sm text-muted-foreground" aria-live="polite">
        {notifications.status === 'unsupported' &&
          'Este dispositivo no admite notificaciones Web Push.'}
        {notifications.status === 'denied' &&
          'El permiso está bloqueado. Actívalo desde la configuración del navegador.'}
        {notifications.status === 'loading' && 'Consultando el estado de las notificaciones…'}
        {notifications.status === 'enabling' && 'Activando recordatorios…'}
        {notifications.status === 'disabling' && 'Desactivando recordatorios…'}
        {notifications.status === 'inactive' &&
          `Recibe un aviso diario a las 8:00 a. m. (${Intl.DateTimeFormat().resolvedOptions().timeZone}).`}
        {notifications.status === 'active' &&
          `Recordatorio diario activo a las 8:00 a. m. (${Intl.DateTimeFormat().resolvedOptions().timeZone}).`}
      </div>
      {notifications.error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {notifications.error}
        </p>
      )}
    </section>
  )
}
