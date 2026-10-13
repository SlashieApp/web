/**
 * AUTO-GENERATED FILE.
 * Run `bun run exports-gen` to regenerate this barrel.
 */

export { AnalyticsErrorBoundary } from './AnalyticsErrorBoundary'
export { apiFetch } from './api-fetch'
export {
  applyCookieConsent,
  getPostHog,
  initPostHogClient,
  isPostHogConfigured,
  markAuthSurfaceSession,
  queueCapture,
} from './posthog-client'
export { capture, getCurrentRoute } from './capture'
export { captureApiError } from './capture-api-error'
export {
  captureTaskDetailOpenedFromSearch,
  captureTaskDetailView,
  resolveTaskDetailViewerRole,
} from './task-detail-view'
export { captureWorkerProfileView } from './worker-profile-view'
export {
  COOKIE_CONSENT_STORAGE_KEY,
  getCookieConsent,
  onCookieConsentChange,
  onCookieSettingsOpen,
  openCookieSettings,
  setCookieConsent,
} from './consent'
export {
  EVENTS,
  isCanonicalAnalyticsEvent,
  resolveAnalyticsEvent,
  STALE_EVENT_ALIASES,
} from './events'
export {
  identifyAuthenticatedUser,
  resetAnalyticsIdentity,
  syncPendingAnalyticsIdentity,
} from './identify-user'
export { sanitizeProperties, truncateMessage } from './sanitize'
export { scrubAnalyticsUrl, scrubEventUrls } from './scrubUrls'
export { trackFlowFailed, trackFlowSucceeded } from './flow-events'
export type {
  AnalyticsEvent,
  CaptureOptions,
  CaptureProperties,
} from './events'
export type {
  ApiErrorSource,
  CaptureApiErrorContext,
} from './capture-api-error'
export type { AuthenticatedUserIdentity } from './identify-user'
export type {
  CaptureTaskDetailViewInput,
  TaskDetailOpenedFromSearchSurface,
  TaskDetailOpenedFromSearchViewer,
  TaskDetailViewerRole,
  TaskDetailViewSource,
} from './task-detail-view'
export type {
  CaptureWorkerProfileViewInput,
  WorkerProfileViewSource,
} from './worker-profile-view'
export type { CookieConsentStatus, CookieConsentValue } from './consent'
