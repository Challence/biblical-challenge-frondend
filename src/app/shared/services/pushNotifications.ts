const INSTALLATION_ID_KEY = 'push-installation-id'
const UNSUBSCRIBE_TOKEN_KEY = 'push-unsubscribe-token'

export type PushAvailability = 'unsupported' | 'denied' | 'inactive' | 'active'

const randomToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes))
}

const storedCredential = (key: string, create: () => string) => {
  const existing = localStorage.getItem(key)
  if (existing) return existing
  const value = create()
  localStorage.setItem(key, value)
  return value
}

export function decodeVapidPublicKey(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0))
}

function supportsPush() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

async function registration() {
  if (!supportsPush()) throw new Error('Este navegador no admite notificaciones push.')
  return navigator.serviceWorker.ready
}

async function updateBackend(action: 'subscribe' | 'unsubscribe', subscription?: PushSubscription) {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Supabase no está configurado.')
  const installationId = storedCredential(INSTALLATION_ID_KEY, () => crypto.randomUUID())
  const token = storedCredential(UNSUBSCRIBE_TOKEN_KEY, randomToken)
  const response = await fetch(`${url}/functions/v1/push-subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      action,
      installationId,
      token,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      subscription: subscription?.toJSON(),
    }),
  })
  if (!response.ok) throw new Error('No se pudo guardar la preferencia de notificaciones.')
}

export async function getPushAvailability(): Promise<PushAvailability> {
  if (!supportsPush() || !import.meta.env.VITE_VAPID_PUBLIC_KEY) return 'unsupported'
  if (Notification.permission === 'denied') return 'denied'
  const subscription = await (await registration()).pushManager.getSubscription()
  return subscription ? 'active' : 'inactive'
}

export async function enablePushNotifications() {
  if (!supportsPush() || !import.meta.env.VITE_VAPID_PUBLIC_KEY)
    throw new Error('Las notificaciones no están disponibles en este dispositivo.')
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') throw new Error('El permiso de notificaciones fue rechazado.')
  const pushManager = (await registration()).pushManager
  const existing = await pushManager.getSubscription()
  const subscription =
    existing ??
    (await pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: decodeVapidPublicKey(import.meta.env.VITE_VAPID_PUBLIC_KEY),
    }))
  try {
    await updateBackend('subscribe', subscription)
  } catch (error) {
    if (!existing) await subscription.unsubscribe()
    throw error
  }
}

export async function disablePushNotifications() {
  const subscription = await (await registration()).pushManager.getSubscription()
  await updateBackend('unsubscribe')
  if (subscription) await subscription.unsubscribe()
}
