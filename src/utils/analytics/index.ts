/**
 * AUTO-GENERATED FILE.
 * Run `bun run exports-gen` to regenerate this barrel.
 */

export { AnalyticsErrorBoundary } from './AnalyticsErrorBoundary'
export { apiFetch } from './api-fetch'
export { capture, getCurrentRoute } from './capture'
export { captureApiError } from './capture-api-error'
export {
  captureTaskDetailView,
  resolveTaskDetailViewerRole,
} from './task-detail-view'
export { captureWorkerProfileView } from './worker-profile-view'
export { EVENTS } from './events'
export {
  getPostHog,
  initPostHogClient,
  isPostHogConfigured,
  queueCapture,
} from './posthog-client'
export {
  identifyAuthenticatedUser,
  resetAnalyticsIdentity,
} from './identify-user'
export { sanitizeProperties, truncateMessage } from './sanitize'
export { trackFlowFailed, trackFlowSucceeded } from './flow-events'
export type { AnalyticsEvent, CaptureProperties } from './events'
export type {
  ApiErrorSource,
  CaptureApiErrorContext,
} from './capture-api-error'
export type { AuthenticatedUserIdentity } from './identify-user'
export type {
  CaptureTaskDetailViewInput,
  TaskDetailViewerRole,
  TaskDetailViewSource,
} from './task-detail-view'
export type {
  CaptureWorkerProfileViewInput,
  WorkerProfileViewSource,
} from './worker-profile-view'
