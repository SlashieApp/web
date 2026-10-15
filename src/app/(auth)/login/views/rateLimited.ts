import type { LoginViewConfig } from './types'

/** Too many attempts (`LOGIN_RATE_LIMITED`, `LOGIN_LOCKED`): Log in counts down. */
export const rateLimited: LoginViewConfig = {
  form: true,
  securityCheck: false,
  primaryAction: 'waitToRetry',
}
