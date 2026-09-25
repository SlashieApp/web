export const WEB_PUSH_SW_URL = '/sw.js'

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const output = new Uint8Array(raw.length)
  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index)
  }
  return output
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

export type WebPushKeys = {
  endpoint: string
  p256dh: string
  auth: string
}

export function pushSubscriptionKeys(
  subscription: PushSubscription,
): WebPushKeys | null {
  const p256dh = subscription.getKey('p256dh')
  const auth = subscription.getKey('auth')
  if (!p256dh || !auth) return null
  return {
    endpoint: subscription.endpoint,
    p256dh: bufferToBase64Url(p256dh),
    auth: bufferToBase64Url(auth),
  }
}

export function webPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    typeof Notification !== 'undefined'
  )
}

export async function readWebPushSubscription(): Promise<PushSubscription | null> {
  if (!webPushSupported()) return null
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return null
  return (await registration.pushManager.getSubscription()) ?? null
}

/**
 * Subscribe after the caller has already started `Notification.requestPermission()`
 * from the settings click, before any other await.
 */
export async function subscribeWebPush(
  vapidPublicKey: string,
  permission: NotificationPermission,
): Promise<PushSubscription | null> {
  if (permission !== 'granted' || !webPushSupported()) return null
  const registration = await navigator.serviceWorker.register(WEB_PUSH_SW_URL)
  await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  if (existing) return existing
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
  })
}

export async function unsubscribeWebPush(): Promise<string | null> {
  const subscription = await readWebPushSubscription()
  if (!subscription) return null
  const endpoint = subscription.endpoint
  await subscription.unsubscribe()
  return endpoint
}
