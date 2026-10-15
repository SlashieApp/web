import type { LoginViewConfig } from './types'

/** Signed out: Google, Apple and the email form. */
export const signIn: LoginViewConfig = {
  form: true,
  securityCheck: false,
  primaryAction: 'logIn',
}
