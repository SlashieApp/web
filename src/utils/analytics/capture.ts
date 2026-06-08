import type { AnalyticsEvent, CaptureProperties } from './events'
import { queueCapture } from './posthog-client'
import { sanitizeProperties } from './sanitize'

export function capture(
  event: AnalyticsEvent | string,
  properties?: CaptureProperties,
): void {
  try {
    queueCapture(event, sanitizeProperties(properties))
  } catch {
    // Analytics must never break product flows.
  }
}

export function getCurrentRoute(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return window.location.pathname
}
