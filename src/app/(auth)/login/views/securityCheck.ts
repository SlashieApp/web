import type { LoginViewConfig } from './types'

/** Third failed attempt, or the API asked: Log in waits for the security check. */
export const securityCheck: LoginViewConfig = {
  form: true,
  securityCheck: true,
  primaryAction: 'logInAfterCheck',
}
