const configuredOrigins = () =>
  (Deno.env.get('APP_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

function isLocalDevelopmentOrigin(origin: string) {
  try {
    const url = new URL(origin)
    return (
      url.protocol === 'http:' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
      url.port !== '' &&
      url.origin === origin
    )
  } catch {
    return false
  }
}

export function isAllowedOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return false

  const allowed = configuredOrigins()
  return allowed.length > 0 ? allowed.includes(origin) : isLocalDevelopmentOrigin(origin)
}

export function corsHeaders(request: Request) {
  const origin = request.headers.get('origin') ?? ''
  return {
    'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-client-info',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
    ...(isAllowedOrigin(request) ? { 'Access-Control-Allow-Origin': origin } : {}),
  }
}

export function json(request: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
  })
}
