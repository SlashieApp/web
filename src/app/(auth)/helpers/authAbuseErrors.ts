import { getGraphQLErrorCode, pickGraphQLError } from '@/utils/graphqlErrors'

/** Rate-limit and lockout codes the API throws (BE-37). */
const RATE_LIMIT_CODES = new Set([
  'LOGIN_RATE_LIMITED',
  'LOGIN_LOCKED',
  'REGISTER_RATE_LIMITED',
  'PASSWORD_RESET_RATE_LIMITED',
])

export type AuthAbuseSignal = {
  code: string | undefined
  rateLimited: boolean
  /** The security check is needed: missing (`CAPTCHA_REQUIRED`) or failed. */
  captchaRequired: boolean
  /** The security check failed or expired (`CAPTCHA_FAILED`). */
  captchaFailed: boolean
  /** Seconds to wait before retrying, when the API provides it. */
  retryAfterSeconds: number | null
}

function readRetryAfterSeconds(error: unknown): number | null {
  const value = pickGraphQLError(error)?.extensions?.retryAfterSeconds
  return typeof value === 'number' && value > 0 ? Math.ceil(value) : null
}

export function parseAuthAbuseError(error: unknown): AuthAbuseSignal {
  const code = getGraphQLErrorCode(error)
  const captchaFailed = code === 'CAPTCHA_FAILED'
  return {
    code,
    rateLimited: code != null && RATE_LIMIT_CODES.has(code),
    captchaRequired: captchaFailed || code === 'CAPTCHA_REQUIRED',
    captchaFailed,
    retryAfterSeconds: readRetryAfterSeconds(error),
  }
}
