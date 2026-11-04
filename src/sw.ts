/// <reference lib="webworker" />

import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ url: string; revision?: string }>
}

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type !== 'SKIP_WAITING') return

  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(self.clients.claim())
})

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')))

type PushPayload = { title?: string; body?: string; url?: string; tag?: string }

self.addEventListener('push', (event: PushEvent) => {
  let payload: PushPayload
  try {
    payload = event.data?.json() as PushPayload
  } catch {
    payload = { body: event.data?.text() }
  }
  const notificationOptions: NotificationOptions & { renotify: boolean } = {
    body: payload.body ?? 'Tu lectura de hoy está lista.',
    tag: payload.tag ?? 'daily-reading-reminder',
    renotify: true,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: payload.url ?? '/lectura-hoy' },
  }
  event.waitUntil(
    self.registration.showNotification(payload.title ?? 'Desafío Bíblico', notificationOptions),
  )
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const target = new URL('/lectura-hoy', self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (clients) => {
      const existing = clients.find(
        (client): client is WindowClient => new URL(client.url).origin === self.location.origin,
      )
      if (existing) {
        try {
          await existing.navigate(target)
          return existing.focus()
        } catch {
          return self.clients.openWindow(target)
        }
      }
      return self.clients.openWindow(target)
    }),
  )
})
