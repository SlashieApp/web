import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import type { MeSnapshot } from '@/app/(auth)/store/user'
import { getGraphQLErrorCode } from '@/utils/graphqlErrors'
import { toE164ForApi } from '@/utils/phoneNormalize'

export const PHONE_VERIFICATION_RATE_LIMITED_ERROR_CODE =
  'PHONE_VERIFICATION_RATE_LIMITED' as const
export const PHONE_NOT_VERIFIED_ERROR_CODE = 'PHONE_NOT_VERIFIED' as const

/** `me.phoneVerified` is the source of truth; profile mirrors it for the owner. */
export function isPhoneVerified(me: MeSnapshot | null | undefined): boolean {
  if (!me) return false
  return me.phoneVerified === true
}

export function hasVerifiedContactMethod(
  me: MeSnapshot | null | undefined,
): boolean {
  return isEmailVerified(me) || isPhoneVerified(me)
}

export function isPhoneVerificationRateLimited(error: unknown): boolean {
  return (
    getGraphQLErrorCode(error) === PHONE_VERIFICATION_RATE_LIMITED_ERROR_CODE
  )
}

export function isPhoneNotVerifiedError(error: unknown): boolean {
  return getGraphQLErrorCode(error) === PHONE_NOT_VERIFIED_ERROR_CODE
}

export function profileContactNumber(
  me: MeSnapshot | null | undefined,
): string {
  return me?.profile?.contactNumber?.trim() ?? ''
}

/** Compares numbers as E.164, so `07…` and `+447…` match. */
export function isSamePhone(a: string, b: string): boolean {
  try {
    return toE164ForApi(a) === toE164ForApi(b)
  } catch {
    return a.trim() === b.trim()
  }
}

/**
 * A new number waiting for its SMS code (`me.pendingPhone`). Empty when there
 * is none, or when it is the saved number's first-time verification.
 */
export function pendingPhoneChange(me: MeSnapshot | null | undefined): string {
  const pending = me?.pendingPhone?.trim() ?? ''
  if (!pending) return ''
  const saved = profileContactNumber(me)
  return saved && isSamePhone(pending, saved) ? '' : pending
}
