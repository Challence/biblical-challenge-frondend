import { createClient } from 'npm:@supabase/supabase-js@2.76.1'
import webpush from 'npm:web-push@3.6.7'
import { nextReminderAt, reminderPayload } from '../_shared/push.ts'

const unauthorized = () => new Response('Unauthorized', { status: 401 })

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const secret = Deno.env.get('PUSH_CRON_SECRET')
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return unauthorized()

  webpush.setVapidDetails(
    Deno.env.get('VAPID_SUBJECT')!,
    Deno.env.get('VAPID_PUBLIC_KEY')!,
    Deno.env.get('VAPID_PRIVATE_KEY')!,
  )
  const client = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )
  const staleClaim = new Date(Date.now() - 10 * 60_000).toISOString()
  const { data, error } = await client
    .from('push_subscriptions')
    .select('id,endpoint,p256dh,auth,timezone,local_hour,failure_count')
    .eq('active', true)
    .lte('next_send_at', new Date().toISOString())
    .or(`claimed_at.is.null,claimed_at.lt.${staleClaim}`)
    .order('next_send_at')
    .limit(100)
  if (error) throw error

  let sent = 0
  let disabled = 0
  for (const subscription of data ?? []) {
    const claimedAt = new Date().toISOString()
    const { data: claimed } = await client
      .from('push_subscriptions')
      .update({ claimed_at: claimedAt })
      .eq('id', subscription.id)
      .eq('active', true)
      .select('id')
      .maybeSingle()
    if (!claimed) continue

    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        reminderPayload,
        { TTL: 60 * 60 },
      )
      await client
        .from('push_subscriptions')
        .update({
          last_sent_at: new Date().toISOString(),
          next_send_at: nextReminderAt(subscription.timezone, subscription.local_hour).toISOString(),
          claimed_at: null,
          failure_count: 0,
        })
        .eq('id', subscription.id)
      sent += 1
    } catch (sendError) {
      const status = (sendError as { statusCode?: number }).statusCode
      const expired = status === 404 || status === 410
      await client
        .from('push_subscriptions')
        .update({
          active: !expired,
          claimed_at: null,
          failure_count: subscription.failure_count + 1,
          next_send_at: nextReminderAt(subscription.timezone, subscription.local_hour).toISOString(),
        })
        .eq('id', subscription.id)
      if (expired) disabled += 1
      console.error('Push delivery failed', subscription.id, status)
    }
  }

  return Response.json({ processed: data?.length ?? 0, sent, disabled })
})
