import posthog from 'posthog-js'

import { getCookieConsent } from './consent'

type QueuedCapture = {
  event: string
  properties?: Record<string, unknown>
}

// Events captured before a consent decision wait here; they flush on accept
// and are dropped on reject. Bounded so an undecided session can't grow it
// indefinitely.
const MAX_QUEUED_CAPTURES = 50
const queuedCaptures: QueuedCapture[] = []
let initialized = false

export function isPostHogConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim())
}

export function initPostHogClient(): void {
  if (typeof window === 'undefined' || initialized) return

  // PECR/UK GDPR: analytics cookies are non-essential. PostHog must not
  // start (and set its ph_* cookies) until the visitor accepts them via the
  // cookie banner. Undecided or rejected -> stay uninitialised.
  if (getCookieConsent() !== 'accepted') return

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim()
  if (!key) return

  posthog.init(key, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_exceptions: true,
    persistence: 'localStorage+cookie',
  })
  initialized = true

  for (const item of queuedCaptures) {
    posthog.capture(item.event, item.properties)
  }
  queuedCaptures.length = 0
}

export function getPostHog(): typeof posthog | null {
  if (typeof window === 'undefined' || !isPostHogConfigured()) return null
  initPostHogClient()
  return initialized ? posthog : null
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
  // No consent decision yet: hold the event in memory (no cookies are set).
  // Rejected: drop it — the visitor opted out of analytics.
  if (getCookieConsent() !== 'unset') return
  if (queuedCaptures.length >= MAX_QUEUED_CAPTURES) return
  queuedCaptures.push({ event, properties })
}
