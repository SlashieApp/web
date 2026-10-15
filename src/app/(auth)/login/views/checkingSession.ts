import type { LoginViewConfig } from './types'

/** A saved session exists: checking it, then leaving for `next` (or /search). */
export const checkingSession: LoginViewConfig = {
  form: false,
  securityCheck: false,
  primaryAction: null,
}
