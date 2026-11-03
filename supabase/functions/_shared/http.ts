const configuredOrigins = () =>
  (Deno.env.get('APP_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

export function corsHeaders(request: Request) {
  const origin = request.headers.get('origin') ?? ''
  const allowed = configuredOrigins()
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : (allowed[0] ?? ''),
    'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

export function isAllowedOrigin(request: Request) {
  const origin = request.headers.get('origin')
  return Boolean(origin && configuredOrigins().includes(origin))
}

export function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
  })
}
