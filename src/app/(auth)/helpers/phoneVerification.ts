import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import type { MeSnapshot } from '@/app/(auth)/store/user'
import { getGraphQLErrorCode } from '@/utils/graphqlErrors'

export const INVALID_PHONE_NUMBER_ERROR_CODE = 'INVALID_PHONE_NUMBER' as const
export const PHONE_VERIFICATION_RATE_LIMITED_ERROR_CODE =
  'PHONE_VERIFICATION_RATE_LIMITED' as const
export const PHONE_VERIFICATION_NOT_REQUESTED_ERROR_CODE =
  'PHONE_VERIFICATION_NOT_REQUESTED' as const
export const INVALID_VERIFICATION_CODE_ERROR_CODE =
  'INVALID_VERIFICATION_CODE' as const
export const TWILIO_VERIFY_NOT_CONFIGURED_ERROR_CODE =
  'TWILIO_VERIFY_NOT_CONFIGURED' as const
export const PHONE_VERIFICATION_FAILED_ERROR_CODE =
  'PHONE_VERIFICATION_FAILED' as const
export const PHONE_MISMATCH_ERROR_CODE = 'PHONE_MISMATCH' as const
export const CONTACT_ALREADY_VERIFIED_ERROR_CODE =
  'CONTACT_ALREADY_VERIFIED' as const
export const PHONE_NOT_VERIFIED_ERROR_CODE = 'PHONE_NOT_VERIFIED' as const
export const PROFILE_PHONE_REQUIRED_ERROR_CODE =
  'PROFILE_PHONE_REQUIRED' as const

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

export function isPhoneMismatchError(error: unknown): boolean {
  return getGraphQLErrorCode(error) === PHONE_MISMATCH_ERROR_CODE
}

export function isPhoneNotVerifiedError(error: unknown): boolean {
  return getGraphQLErrorCode(error) === PHONE_NOT_VERIFIED_ERROR_CODE
}

export function profileContactNumber(
  me: MeSnapshot | null | undefined,
): string {
  return me?.profile?.contactNumber?.trim() ?? ''
}
