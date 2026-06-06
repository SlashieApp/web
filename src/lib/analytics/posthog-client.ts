import posthog from 'posthog-js'

type QueuedCapture = {
  event: string
  properties?: Record<string, unknown>
}

const queuedCaptures: QueuedCapture[] = []
let initAttempted = false

export function isPostHogConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim())
}

export function initPostHogClient(): void {
  if (typeof window === 'undefined' || initAttempted) return
  initAttempted = true

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
  if (!key) return

  posthog.init(key, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
    capture_pageview: false,
    capture_exceptions: true,
    persistence: 'localStorage+cookie',
  })

  for (const item of queuedCaptures) {
    posthog.capture(item.event, item.properties)
  }
  queuedCaptures.length = 0
}

export function getPostHog(): typeof posthog | null {
  if (typeof window === 'undefined' || !isPostHogConfigured()) return null
  initPostHogClient()
  return posthog
}

export function queueCapture(
  event: string,
  properties?: Record<string, unknown>,
): void {
  if (typeof window === 'undefined') return
  const ph = getPostHog()
  if (ph) {
    ph.capture(event, properties)
    return
  }
  queuedCaptures.push({ event, properties })
}
