import { createClient } from 'npm:@supabase/supabase-js@2.76.1'
import { corsHeaders, isAllowedOrigin, json } from '../_shared/http.ts'

const clientFor = (request: Request) =>
  createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY')!,
    {
      global: { headers: { Authorization: request.headers.get('Authorization') ?? '' } },
      auth: { persistSession: false },
    },
  )

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(request) })
  if (!['GET', 'POST'].includes(request.method))
    return json(request, { error: 'Método no permitido.' }, 405)
  if (!isAllowedOrigin(request)) return json(request, { error: 'Origen no permitido.' }, 403)
  try {
    const client = clientFor(request)
    if (request.method === 'GET') {
      const { data, error } = await client.rpc('get_push_reminder_settings')
      if (error) throw error
      return json(request, data?.[0] ?? {})
    }
    const body = (await request.json()) as { reminderHour?: unknown }
    if (
      !Number.isInteger(body.reminderHour) ||
      (body.reminderHour as number) < 0 ||
      (body.reminderHour as number) > 23
    )
      return json(request, { error: 'La hora debe ser un entero entre 0 y 23.' }, 400)
    const { data, error } = await client.rpc('set_push_reminder_hour', {
      p_reminder_hour: body.reminderHour,
    })
    if (error) throw error
    return json(request, data?.[0] ?? {})
  } catch (error) {
    console.error(error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('authentication required'))
      return json(request, { error: 'Debes iniciar sesión.' }, 401)
    if (errorMessage.includes('reminder hour must be between'))
      return json(request, { error: 'La hora debe ser un entero entre 0 y 23.' }, 400)
    return json(request, { error: 'No se pudo actualizar la configuración.' }, 500)
  }
})
