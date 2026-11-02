import { describe, expect, it, vi } from 'vitest'

describe('decodeVapidPublicKey', () => {
  it('decodifica base64 URL-safe', async () => {
    vi.stubEnv('VITE_VAPID_PUBLIC_KEY', 'AQIDBA')
    const { decodeVapidPublicKey } = await import('./pushNotifications')
    expect(Array.from(decodeVapidPublicKey('AQIDBA'))).toEqual([1, 2, 3, 4])
  })
})
