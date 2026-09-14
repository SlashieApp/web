import {
  type AnalyticsEvent,
  type CaptureProperties,
  toCanonicalAnalyticsEvent,
} from './events'
import { type QueueCaptureOptions, queueCapture } from './posthog-client'
import { sanitizeProperties } from './sanitize'

export type CaptureOptions = QueueCaptureOptions

export function capture(
  event: AnalyticsEvent | string,
  properties?: CaptureProperties,
  options?: CaptureOptions,
): void {
  try {
    queueCapture(
      toCanonicalAnalyticsEvent(event),
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
