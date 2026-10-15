import { ServerError, ServerParseError } from '@apollo/client/errors'

import { parseAuthAbuseError } from '@/app/(auth)/helpers/authAbuseErrors'
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
  const abuse = parseAuthAbuseError(error)
  if (abuse.captchaFailed) return 'securityCheckFailed'
  if (abuse.captchaRequired) return 'securityCheckRequired'
  if (abuse.rateLimited) return 'rateLimited'
  if (getGraphQLErrorCode(error) === 'INVALID_CREDENTIALS') {
    return 'invalidCredentials'
  }
  // fetch rejects with a TypeError when the API can't be reached.
  if (
    error instanceof TypeError ||
    ServerError.is(error) ||
    ServerParseError.is(error)
  ) {
    return 'networkError'
  }
  return 'failed'
}
