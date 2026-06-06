import type { MeSnapshot } from '@/app/(auth)/store/user'
import { getGraphQLErrorCode } from '@/utils/graphqlErrors'

export const EMAIL_NOT_VERIFIED_ERROR_CODE = 'EMAIL_NOT_VERIFIED' as const
export const INVALID_OR_EXPIRED_VERIFICATION_ERROR_CODE =
  'INVALID_OR_EXPIRED_VERIFICATION' as const
export const RESEND_VERIFICATION_RATE_LIMITED_ERROR_CODE =
  'RESEND_VERIFICATION_RATE_LIMITED' as const
export const EMAIL_MISMATCH_ERROR_CODE = 'EMAIL_MISMATCH' as const

/** `me.emailVerified` is the source of truth; profile mirrors it for the owner. */
export function isEmailVerified(me: MeSnapshot | null | undefined): boolean {
  if (!me) return false
  return me.emailVerified === true
}

export function isEmailNotVerifiedError(error: unknown): boolean {
  return getGraphQLErrorCode(error) === EMAIL_NOT_VERIFIED_ERROR_CODE
}

export function isInvalidOrExpiredVerificationError(error: unknown): boolean {
  return (
    getGraphQLErrorCode(error) === INVALID_OR_EXPIRED_VERIFICATION_ERROR_CODE
  )
}

export function isResendVerificationRateLimitedError(error: unknown): boolean {
  return (
    getGraphQLErrorCode(error) === RESEND_VERIFICATION_RATE_LIMITED_ERROR_CODE
  )
}

export function isEmailMismatchError(error: unknown): boolean {
  return getGraphQLErrorCode(error) === EMAIL_MISMATCH_ERROR_CODE
}
