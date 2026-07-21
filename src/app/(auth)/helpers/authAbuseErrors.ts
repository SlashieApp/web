import { getGraphQLErrorCode, pickGraphQLError } from '@/utils/graphqlErrors'

/** Error codes the API may return for auth abuse / CAPTCHA (extend as BE ships). */
export const AUTH_ABUSE_ERROR_CODES = [
  'RATE_LIMITED',
  'TOO_MANY_REQUESTS',
  'AUTH_RATE_LIMITED',
  'LOGIN_RATE_LIMITED',
  'PASSWORD_RESET_RATE_LIMITED',
  'REGISTER_RATE_LIMITED',
  'ACCOUNT_TEMPORARILY_LOCKED',
  'LOGIN_LOCKED',
  'CAPTCHA_REQUIRED',
  'CAPTCHA_FAILED',
  'INVALID_CAPTCHA',
  'TURNSTILE_FAILED',
] as const

export type AuthAbuseErrorCode = (typeof AUTH_ABUSE_ERROR_CODES)[number]

const RATE_LIMIT_CODES = new Set<string>([
  'RATE_LIMITED',
  'TOO_MANY_REQUESTS',
  'AUTH_RATE_LIMITED',
  'LOGIN_RATE_LIMITED',
  'PASSWORD_RESET_RATE_LIMITED',
  'REGISTER_RATE_LIMITED',
  'ACCOUNT_TEMPORARILY_LOCKED',
  'LOGIN_LOCKED',
])

export type AuthAbuseSignal = {
  code: string | undefined
  rateLimited: boolean
  captchaRequired: boolean
  captchaFailed: boolean
  /** Seconds to wait before retrying, when the API provides it. */
  retryAfterSeconds: number | null
}

function readRetryAfterSeconds(error: unknown): number | null {
  const graphQLError = pickGraphQLError(error)
  const extensions = graphQLError?.extensions as
    | {
        retryAfter?: unknown
        retry_after?: unknown
        retryAfterSeconds?: unknown
        cooldownSecondsRemaining?: unknown
      }
    | undefined
  if (!extensions) return null

  const candidates = [
    extensions.retryAfterSeconds,
    extensions.retryAfter,
    extensions.retry_after,
    extensions.cooldownSecondsRemaining,
  ]
  for (const value of candidates) {
    const n =
      typeof value === 'number'
        ? value
        : typeof value === 'string'
          ? Number(value)
          : Number.NaN
    if (Number.isFinite(n) && n > 0) return Math.ceil(n)
  }
  return null
}

export function parseAuthAbuseError(error: unknown): AuthAbuseSignal {
  const code = getGraphQLErrorCode(error)
  const normalised = code?.trim().toUpperCase()
  const captchaFailed =
    normalised === 'CAPTCHA_FAILED' ||
    normalised === 'INVALID_CAPTCHA' ||
    normalised === 'TURNSTILE_FAILED'
  const captchaRequired =
    captchaFailed || normalised === 'CAPTCHA_REQUIRED' || false
  const rateLimited = Boolean(normalised && RATE_LIMIT_CODES.has(normalised))

  return {
    code: normalised,
    rateLimited,
    captchaRequired: Boolean(captchaRequired),
    captchaFailed,
    retryAfterSeconds: readRetryAfterSeconds(error),
  }
}

export function isAuthAbuseError(error: unknown): boolean {
  const signal = parseAuthAbuseError(error)
  return signal.rateLimited || signal.captchaRequired || signal.captchaFailed
}

/**
 * Calm, non-enumerating recovery copy. Never implies whether an email exists.
 */
export function getAuthAbuseFriendlyMessage(
  error: unknown,
  fallback: string,
): string {
  const signal = parseAuthAbuseError(error)
  if (signal.captchaFailed || signal.code === 'CAPTCHA_REQUIRED') {
    return 'Security check failed or expired. Complete it again and retry.'
  }
  if (signal.rateLimited) {
    if (signal.retryAfterSeconds && signal.retryAfterSeconds > 0) {
      return `Too many attempts. Please wait ${signal.retryAfterSeconds} seconds, then try again. You can also sign in with Google if available.`
    }
    return 'Too many attempts right now. Please wait a bit and try again, or sign in with Google if available.'
  }
  return fallback
}
