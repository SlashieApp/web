import { commonAuthMessage } from '@/app/(auth)/helpers/authMessages'
import { getGraphQLErrorCode } from '@/utils/graphqlErrors'

import type { LoginMessage, LoginView } from './types'

export type LoginViewInput = {
  /** `checking` while a saved session is verified, and while leaving after. */
  session: 'checking' | 'signedOut'
  /** Seconds before the API allows another attempt; 0 when there's no wait. */
  retryInSeconds: number
  /** The security check is needed (3 failed attempts, or the API asked). */
  securityCheckRequired: boolean
}

/** The session comes first, then a running wait, then the security check. */
export function getLoginView({
  session,
  retryInSeconds,
  securityCheckRequired,
}: LoginViewInput): LoginView {
  if (session === 'checking') return 'checkingSession'
  if (retryInSeconds > 0) return 'rateLimited'
  if (securityCheckRequired) return 'securityCheck'
  return 'signIn'
}

/** The message a failed attempt shows. */
export function loginMessageFor(error: unknown): LoginMessage {
  if (getGraphQLErrorCode(error) === 'INVALID_CREDENTIALS') {
    return 'invalidCredentials'
  }
  return commonAuthMessage(error) ?? 'failed'
}
