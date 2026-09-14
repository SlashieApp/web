import {
  type AnalyticsEvent,
  type CaptureOptions,
  type CaptureProperties,
  resolveAnalyticsEvent,
} from './events'
import { queueCapture } from './posthog-client'
import { sanitizeProperties } from './sanitize'

export function capture(
  event: AnalyticsEvent | string,
  properties?: CaptureProperties,
  options?: CaptureOptions,
): void {
  try {
    queueCapture(
      resolveAnalyticsEvent(event),
      sanitizeProperties(properties),
      options,
    )
  } catch {
    // Analytics must never break product flows.
  }
}

export function getCurrentRoute(): string | undefined {
  if (typeof window === 'undefined') return undefined
  return window.location.pathname
}
