import { LoginMethod } from '@codegen/schema'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { getGraphQLErrorCode } from '@/utils/graphqlErrors'

export const RESEND_VERIFICATION_RATE_LIMITED_ERROR_CODE =
  'RESEND_VERIFICATION_RATE_LIMITED' as const

/** `me.emailVerified` is the source of truth; profile mirrors it for the owner. */
export function isEmailVerified(me: MeSnapshot | null | undefined): boolean {
  if (!me) return false
  return me.emailVerified === true
}

export function isResendVerificationRateLimitedError(error: unknown): boolean {
  return (
    getGraphQLErrorCode(error) === RESEND_VERIFICATION_RATE_LIMITED_ERROR_CODE
  )
}

/** New email waiting for its verify link; `me.email` stays live until then. */
export function pendingEmailChange(me: MeSnapshot | null | undefined): string {
  return me?.pendingEmail?.trim() ?? ''
}

/** Only password accounts can change email; Google-only keeps its Google email. */
export function canChangeEmail(me: MeSnapshot | null | undefined): boolean {
  return me?.enabledLoginMethods?.includes(LoginMethod.Password) ?? false
}
