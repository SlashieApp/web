import type { CreateTaskViewConfig } from './types'

/**
 * Signed in, email not verified: before the first step, so nobody fills the
 * flow in only to be stopped at Review. Verify email goes to the sent screen
 * and comes back here.
 */
export const createVerifyEmail: CreateTaskViewConfig = {
  layout: 'verifyEmail',
}
