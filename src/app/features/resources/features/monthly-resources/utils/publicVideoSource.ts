export type PublicVideoSource =
  | { type: 'embed'; url: string }
  | { type: 'native'; url: string }
  | { type: 'external'; url: string }

export function getPublicVideoSource(value: string): PublicVideoSource {
  const url = new URL(value)
  const host = url.hostname.replace(/^www\./, '').toLowerCase()

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0]
    if (id) return { type: 'embed', url: `https://www.youtube.com/embed/${id}` }
  }

  if (host === 'youtube.com' || host === 'm.youtube.com') {
    const id =
      url.searchParams.get('v') ??
      (/^\/(?:embed|shorts)\/([^/]+)/.exec(url.pathname)?.[1] || undefined)
    if (id) return { type: 'embed', url: `https://www.youtube.com/embed/${id}` }
  }

  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = url.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part))
    if (id) return { type: 'embed', url: `https://player.vimeo.com/video/${id}` }
  }

  if (/\.(?:mp4|webm|ogg)$/i.test(url.pathname)) return { type: 'native', url: value }

  return { type: 'external', url: value }
}
