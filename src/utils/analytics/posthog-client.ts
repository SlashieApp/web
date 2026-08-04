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

function getPostHogConfig(): { token: string; host: string } | null {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim()
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim()

  if (process.env.NODE_ENV !== 'production') {
    if (!token) {
      console.error(
        new Error(
          'NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured',
        ),
      )
    }
    if (!host) {
      console.error(
        new Error(
          'NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured',
        ),
      )
    }
  }

  return token && host ? { token, host } : null
}

export function isPostHogConfigured(): boolean {
  return getPostHogConfig() !== null
}

export function initPostHogClient(): void {
  if (typeof window === 'undefined' || initialized) return

  // PECR/UK GDPR: analytics cookies are non-essential. PostHog must not
  // start (and set its ph_* cookies) until the visitor accepts them via the
  // cookie banner. Undecided or rejected -> stay uninitialised.
  if (getCookieConsent() !== 'accepted') return

  const config = getPostHogConfig()
  if (!config) return

  posthog.init(config.token, {
    api_host: config.host,
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

/**
 * Tag the current PostHog session as an auth surface so ops can filter
 * low-interaction auth-only noise (foreign $pageviews on /login, etc.).
 * Safe no-op when PostHog is off or consent is not accepted.
 */
export function markAuthSurfaceSession(): void {
  if (typeof window === 'undefined') return
  try {
    const ph = getPostHog()
    ph?.register_for_session?.({ auth_surface: true })
  } catch {
    // Analytics must never break auth flows.
  }
}
