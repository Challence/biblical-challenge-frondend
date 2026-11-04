import { supabase } from '@/app/shared/lib/supabase'

export interface PushReminderSettings {
  reminder_hour: number
}

interface PushReminderSettingsResponse extends PushReminderSettings {
  updated_subscriptions?: number
}

function endpoint() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key || !supabase) throw new Error('Supabase no está configurado.')
  return { url: `${url}/functions/v1/push-reminder-settings`, key }
}

async function request(method: 'GET' | 'POST', body?: { reminderHour: number }) {
  const { url, key } = endpoint()
  const { data } = await supabase!.auth.getSession()
  const response = await fetch(url, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${data.session?.access_token ?? key}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const payload = (await response.json().catch(() => ({}))) as {
    error?: string
  } & PushReminderSettingsResponse
  if (!response.ok)
    throw new Error(payload.error ?? 'No se pudo actualizar la hora del recordatorio.')
  return payload
}

export function getPushReminderSettings() {
  return request('GET')
}

export function savePushReminderSettings(reminderHour: number) {
  return request('POST', { reminderHour })
}
