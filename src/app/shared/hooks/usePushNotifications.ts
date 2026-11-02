import { useEffect, useState } from 'react'
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushAvailability,
  type PushAvailability,
} from '@/app/shared/services/pushNotifications'

type PushStatus = PushAvailability | 'loading' | 'enabling' | 'disabling' | 'error'

export function usePushNotifications() {
  const [status, setStatus] = useState<PushStatus>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    void getPushAvailability()
      .then((availability) => {
        if (!cancelled) setStatus(availability)
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('error')
          setError('No se pudo consultar el estado de las notificaciones.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const enable = async () => {
    setError('')
    setStatus('enabling')
    try {
      await enablePushNotifications()
      setStatus('active')
    } catch (cause) {
      setStatus(Notification.permission === 'denied' ? 'denied' : 'error')
      setError(cause instanceof Error ? cause.message : 'No se pudieron activar las notificaciones.')
    }
  }

  const disable = async () => {
    setError('')
    setStatus('disabling')
    try {
      await disablePushNotifications()
      setStatus('inactive')
    } catch {
      setStatus('error')
      setError('No se pudieron desactivar las notificaciones.')
    }
  }

  return { status, error, enable, disable }
}
