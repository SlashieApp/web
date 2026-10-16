import { ServerError, ServerParseError } from '@apollo/client/errors'

import { parseAuthAbuseError } from './authAbuseErrors'

/**
 * Outcomes every auth form can show, worded once in
 * `components/i11n.json` → `messages`. Pages add their own keys (wrong
 * password, email taken, expired link) and a `failed` fallback.
 */
export type AuthCommonMessage =
  | 'securityCheckRequired'
  | 'securityCheckFailed'
  | 'rateLimited'
  | 'networkError'

/** The request never reached the API: fetch failed or a bad gateway. */
export function isNetworkFailure(error: unknown): boolean {
  return (
    error instanceof TypeError ||
    ServerError.is(error) ||
    ServerParseError.is(error)
  )
}

/** The shared outcome for an error, or null when the page words it itself. */
export function commonAuthMessage(error: unknown): AuthCommonMessage | null {
  const abuse = parseAuthAbuseError(error)
  if (abuse.captchaFailed) return 'securityCheckFailed'
  if (abuse.captchaRequired) return 'securityCheckRequired'
  if (abuse.rateLimited) return 'rateLimited'
  if (isNetworkFailure(error)) return 'networkError'
  return null
}
