import { createClient } from 'npm:@supabase/supabase-js@2.76.1'
import { corsHeaders, isAllowedOrigin, json } from '../_shared/http.ts'

const MAX_BODY_BYTES = 32 * 1024
const MAX_EVENTS_PER_WINDOW = 30
const RATE_WINDOW_MS = 60_000
const eventTypes = new Set([
  'session_started',
  'page_viewed',
  'announcement_clicked',
  'reading_completed',
  'video_viewed',
  'resource_viewed',
  'content_shared',
  'segment_viewed',
  'pwa_installed',
])
const rateLimits = new Map<string, { started: number; count: number }>()

type EventBody = {
  eventId: string
  event: Record<string, unknown>
  context: {
    anonymousId: string
    sessionId: string
    path: string
    os: 'android' | 'ios' | 'other'
    displayMode: 'standalone' | 'browser'
    locale: string
    timezone: string
  }
  occurredAt: string
}

const text = (value: unknown, min: number, max: number) =>
  typeof value === 'string' && value.trim().length >= min && value.trim().length <= max

function validEvent(event: Record<string, unknown>) {
  if (!eventTypes.has(event.type as string)) return false
  const fields: Record<string, string[]> = {
    session_started: ['type'],
    page_viewed: ['type', 'path'],
    announcement_clicked: ['type', 'announcementId'],
    reading_completed: ['type', 'segmentId', 'day'],
    video_viewed: ['type', 'resourceId', 'watchedSeconds'],
    resource_viewed: ['type', 'resourceId', 'resourceType'],
    content_shared: ['type', 'entityType', 'entityId', 'method'],
    segment_viewed: ['type', 'segmentId'],
    pwa_installed: ['type', 'source'],
  }
  if (Object.keys(event).some((key) => !fields[event.type as string].includes(key))) return false
  switch (event.type) {
    case 'session_started':
      return Object.keys(event).length === 1
    case 'page_viewed':
      return text(event.path, 1, 2048)
    case 'announcement_clicked':
      return text(event.announcementId, 1, 256)
    case 'reading_completed':
      return (
        text(event.segmentId, 1, 256) && Number.isInteger(event.day) && (event.day as number) >= 1
      )
    case 'video_viewed':
      return (
        text(event.resourceId, 1, 256) &&
        typeof event.watchedSeconds === 'number' &&
        Number.isFinite(event.watchedSeconds) &&
        event.watchedSeconds >= 0
      )
    case 'resource_viewed':
      return (
        text(event.resourceId, 1, 256) &&
        (event.resourceType === 'image' || event.resourceType === 'video')
      )
    case 'content_shared':
      return (
        ['segment', 'reading', 'resource', 'announcement'].includes(event.entityType as string) &&
        text(event.entityId, 1, 256) &&
        ['native', 'clipboard'].includes(event.method as string)
      )
    case 'segment_viewed':
      return text(event.segmentId, 1, 256)
    case 'pwa_installed':
      return event.source === 'appinstalled' || event.source === 'standalone'
    default:
      return false
  }
}

function validBody(body: unknown): body is EventBody {
  if (!body || typeof body !== 'object') return false
  const value = body as Partial<EventBody>
  const context = value.context
  return (
    text(value.eventId, 1, 128) &&
    !!value.event &&
    typeof value.event === 'object' &&
    validEvent(value.event as Record<string, unknown>) &&
    !!context &&
    text(context.anonymousId, 1, 128) &&
    text(context.sessionId, 1, 128) &&
    text(context.path, 1, 2048) &&
    ['android', 'ios', 'other'].includes(context.os) &&
    ['standalone', 'browser'].includes(context.displayMode) &&
    text(context.locale, 2, 128) &&
    text(context.timezone, 1, 128) &&
    typeof value.occurredAt === 'string' &&
    Number.isFinite(Date.parse(value.occurredAt))
  )
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(request) })
  if (request.method !== 'POST') return json(request, { error: 'Método no permitido.' }, 405)
  if (!isAllowedOrigin(request)) return json(request, { error: 'Origen no permitido.' }, 403)

  try {
    const length = Number(request.headers.get('content-length') ?? 0)
    if (length > MAX_BODY_BYTES) return json(request, { error: 'Payload inválido.' }, 413)
    const raw = await request.text()
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES)
      return json(request, { error: 'Payload inválido.' }, 413)
    const body: unknown = JSON.parse(raw)
    if (!validBody(body)) return json(request, { error: 'Payload inválido.' }, 400)

    const key = body.context.anonymousId
    const now = Date.now()
    const current = rateLimits.get(key)
    if (!current || now - current.started >= RATE_WINDOW_MS)
      rateLimits.set(key, { started: now, count: 1 })
    else if (current.count >= MAX_EVENTS_PER_WINDOW)
      return json(request, { error: 'Demasiadas solicitudes.' }, 429)
    else current.count += 1

    const client = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    )
    const { error } = await client.from('analytics_events').insert(
      {
        event_id: body.eventId,
        event_type: body.event.type,
        event_data: body.event,
        anonymous_id: body.context.anonymousId,
        session_id: body.context.sessionId,
        path: body.context.path,
        operating_system: body.context.os,
        display_mode: body.context.displayMode,
        locale: body.context.locale,
        timezone: body.context.timezone,
        occurred_at: body.occurredAt,
      },
      { onConflict: 'event_id', ignoreDuplicates: true },
    )
    // The local PostgREST version may still surface the unique violation even
    // when the client requests duplicate-ignore resolution. The event_id
    // constraint is the idempotency boundary, so a duplicate is accepted.
    if (error && error.code !== '23505') throw error
    return json(request, { accepted: true })
  } catch (error) {
    console.error('Analytics event rejected', error)
    return json(request, { error: 'No se pudo registrar el evento.' }, 400)
  }
})
