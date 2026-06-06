/**
 * AUTO-GENERATED FILE.
 * Run `bun run exports-gen` to regenerate this barrel.
 */

export { AnalyticsErrorBoundary } from './AnalyticsErrorBoundary'
export { apiFetch } from './api-fetch'
export { capture, getCurrentRoute } from './capture'
export { captureApiError } from './capture-api-error'
export { EVENTS } from './events'
export {
  getPostHog,
  initPostHogClient,
  isPostHogConfigured,
  queueCapture,
} from './posthog-client'
export { identifyUser, resetAnalyticsIdentity } from './identify'
export { sanitizeProperties, truncateMessage } from './sanitize'
export { trackFlowFailed, trackFlowSucceeded } from './flow-events'
export type { AnalyticsEvent, CaptureProperties } from './events'
export type {
  ApiErrorSource,
  CaptureApiErrorContext,
} from './capture-api-error'
