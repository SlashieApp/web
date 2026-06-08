// Event names follow PostHog-style convention ({object}_view, {action}_success|fail).
// Keep in sync with apollo src/data/posthog/events.ts (PostHogEvents.TASK_VIEW).

/** Allowlisted PostHog event names (short snake_case). */
export const EVENTS = {
  // Visitor / discovery
  browse_view: 'browse_view',
  task_view: 'task_view',
  task_load: 'task_load',
  task_load_fail: 'task_load_fail',
  task_not_found_view: 'task_not_found_view',
  worker_view: 'worker_view',
  workers_view: 'workers_view',
  login_gate: 'login_gate',

  // Auth
  login_success: 'login_success',
  login_fail: 'login_fail',
  register_success: 'register_success',
  register_fail: 'register_fail',
  google_login_success: 'google_login_success',
  google_login_fail: 'google_login_fail',
  apple_login_success: 'apple_login_success',
  apple_login_fail: 'apple_login_fail',
  password_reset_request: 'password_reset_request',
  password_reset_request_fail: 'password_reset_request_fail',
  password_reset_success: 'password_reset_success',
  password_reset_fail: 'password_reset_fail',

  // Email / phone verify
  email_verify_success: 'email_verify_success',
  email_verify_fail: 'email_verify_fail',
  email_resend_success: 'email_resend_success',
  email_resend_fail: 'email_resend_fail',
  phone_verify_send_success: 'phone_verify_send_success',
  phone_verify_send_fail: 'phone_verify_send_fail',
  phone_verify_success: 'phone_verify_success',
  phone_verify_fail: 'phone_verify_fail',

  // Customer
  task_create_success: 'task_create_success',
  task_create_fail: 'task_create_fail',
  quote_accept_success: 'quote_accept_success',
  quote_accept_fail: 'quote_accept_fail',
  quote_decline_success: 'quote_decline_success',
  quote_decline_fail: 'quote_decline_fail',
  requests_view: 'requests_view',

  // Worker
  quote_send_success: 'quote_send_success',
  quote_send_fail: 'quote_send_fail',
  worker_setup_success: 'worker_setup_success',
  worker_setup_fail: 'worker_setup_fail',
  task_save_success: 'task_save_success',
  task_save_fail: 'task_save_fail',
  quotes_view: 'quotes_view',
  jobs_view: 'jobs_view',
  job_verify_success: 'job_verify_success',
  job_verify_fail: 'job_verify_fail',

  // Profile / dashboard
  profile_update_success: 'profile_update_success',
  profile_update_fail: 'profile_update_fail',
  notification_open: 'notification_open',
  order_view: 'order_view',
  dashboard_view: 'dashboard_view',

  // Closure
  job_done_success: 'job_done_success',
  job_done_fail: 'job_done_fail',
  order_confirm_success: 'order_confirm_success',
  order_confirm_fail: 'order_confirm_fail',

  // Global errors
  graphql_error: 'graphql_error',
  api_fetch_fail: 'api_fetch_fail',
} as const

export type AnalyticsEvent = (typeof EVENTS)[keyof typeof EVENTS]

export type CaptureProperties = Record<
  string,
  string | number | boolean | null | undefined
>
