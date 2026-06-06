/** Allowlisted PostHog event names (snake_case, past tense). */
export const EVENTS = {
  // Visitor / discovery
  browse_tasks_viewed: 'browse_tasks_viewed',
  task_detail_viewed: 'task_detail_viewed',
  task_detail_loaded: 'task_detail_loaded',
  task_detail_load_failed: 'task_detail_load_failed',
  task_not_found_viewed: 'task_not_found_viewed',
  login_gate_shown: 'login_gate_shown',

  // Auth
  login_succeeded: 'login_succeeded',
  login_failed: 'login_failed',
  register_succeeded: 'register_succeeded',
  register_failed: 'register_failed',
  google_login_succeeded: 'google_login_succeeded',
  google_login_failed: 'google_login_failed',
  password_reset_requested: 'password_reset_requested',
  password_reset_request_failed: 'password_reset_request_failed',
  password_reset_succeeded: 'password_reset_succeeded',
  password_reset_failed: 'password_reset_failed',

  // Email / phone verify
  email_verify_succeeded: 'email_verify_succeeded',
  email_verify_failed: 'email_verify_failed',
  email_resend_succeeded: 'email_resend_succeeded',
  email_resend_failed: 'email_resend_failed',
  phone_verify_send_succeeded: 'phone_verify_send_succeeded',
  phone_verify_send_failed: 'phone_verify_send_failed',
  phone_verify_succeeded: 'phone_verify_succeeded',
  phone_verify_failed: 'phone_verify_failed',

  // Customer
  task_create_succeeded: 'task_create_succeeded',
  task_create_failed: 'task_create_failed',
  quote_accept_succeeded: 'quote_accept_succeeded',
  quote_accept_failed: 'quote_accept_failed',
  quote_decline_succeeded: 'quote_decline_succeeded',
  quote_decline_failed: 'quote_decline_failed',
  my_requests_viewed: 'my_requests_viewed',

  // Worker
  quote_send_succeeded: 'quote_send_succeeded',
  quote_send_failed: 'quote_send_failed',
  worker_setup_succeeded: 'worker_setup_succeeded',
  worker_setup_failed: 'worker_setup_failed',
  task_save_succeeded: 'task_save_succeeded',
  task_save_failed: 'task_save_failed',
  jobs_list_viewed: 'jobs_list_viewed',
  job_verify_code_succeeded: 'job_verify_code_succeeded',
  job_verify_code_failed: 'job_verify_code_failed',

  // Profile / dashboard
  profile_updated: 'profile_updated',
  profile_update_failed: 'profile_update_failed',
  notification_opened: 'notification_opened',
  order_detail_viewed: 'order_detail_viewed',

  // Closure
  job_mark_done_succeeded: 'job_mark_done_succeeded',
  job_mark_done_failed: 'job_mark_done_failed',
  order_confirm_succeeded: 'order_confirm_succeeded',
  order_confirm_failed: 'order_confirm_failed',

  // Global errors
  graphql_error: 'graphql_error',
  api_fetch_failed: 'api_fetch_failed',
} as const

export type AnalyticsEvent = (typeof EVENTS)[keyof typeof EVENTS]

export type CaptureProperties = Record<
  string,
  string | number | boolean | null | undefined
>
