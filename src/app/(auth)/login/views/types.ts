/**
 * Where the login screen stands. `getLoginView` picks one; each has a config
 * file in this folder and a row in README.md.
 */
export type LoginView =
  | 'checkingSession'
  | 'signIn'
  | 'securityCheck'
  | 'rateLimited'

/** The line under the form after a failed attempt (copy: `messages.*`). */
export type LoginMessage =
  | 'invalidCredentials'
  | 'securityCheckRequired'
  | 'securityCheckFailed'
  | 'rateLimited'
  | 'networkError'
  | 'failed'

/** What the main button does. */
export type LoginPrimaryAction =
  /** Log in. */
  | 'logIn'
  /** Log in, enabled once the security check is solved. */
  | 'logInAfterCheck'
  /** Disabled, counting down to the retry ("Try again in 12s"). */
  | 'waitToRetry'

export type LoginViewConfig = {
  /** False shows the branded session splash instead of the sign-in column. */
  form: boolean
  /** The security check (Turnstile) above the main button. */
  securityCheck: boolean
  primaryAction: LoginPrimaryAction | null
}
