import { createClient } from 'npm:@supabase/supabase-js@2.76.1'
import { corsHeaders, isAllowedOrigin, json } from '../_shared/http.ts'
import { assertTimezone, nextReminderAt, sha256 } from '../_shared/push.ts'

type SubscriptionBody = {
  action: 'subscribe' | 'unsubscribe'
  installationId: string
  token: string
  timezone?: string
  subscription?: {
    endpoint: string
    keys: { p256dh: string; auth: string }
  }
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(request) })
  if (request.method !== 'POST') return json(request, { error: 'Método no permitido.' }, 405)
  if (!isAllowedOrigin(request)) return json(request, { error: 'Origen no permitido.' }, 403)

  try {
    const body = (await request.json()) as SubscriptionBody
    if (!uuidPattern.test(body.installationId) || body.token?.length < 32)
      return json(request, { error: 'Identificador de instalación inválido.' }, 400)

    const client = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )
    const tokenHash = await sha256(body.token)

    if (body.action === 'unsubscribe') {
      const { error } = await client
        .from('push_subscriptions')
        .delete()
        .eq('installation_id', body.installationId)
        .eq('unsubscribe_token_hash', tokenHash)
      if (error) throw error
      return json(request, { active: false })
    }

    if (!body.subscription || !body.timezone) return json(request, { error: 'Suscripción incompleta.' }, 400)
    assertTimezone(body.timezone)
    const endpoint = new URL(body.subscription.endpoint)
    if (endpoint.protocol !== 'https:') return json(request, { error: 'Endpoint inválido.' }, 400)
    const { p256dh, auth } = body.subscription.keys
    if (!p256dh || !auth || p256dh.length > 512 || auth.length > 512)
      return json(request, { error: 'Claves de suscripción inválidas.' }, 400)

    const { error } = await client.from('push_subscriptions').upsert(
      {
        installation_id: body.installationId,
        endpoint: endpoint.toString(),
        p256dh,
        auth,
        unsubscribe_token_hash: tokenHash,
        timezone: body.timezone,
        local_hour: 8,
        next_send_at: nextReminderAt(body.timezone).toISOString(),
        claimed_at: null,
        failure_count: 0,
        active: true,
      },
      { onConflict: 'installation_id' },
    )
    if (error) throw error
    return json(request, { active: true })
  } catch (error) {
    console.error(error)
    return json(request, { error: 'No se pudo actualizar la suscripción.' }, 400)
  }
})
