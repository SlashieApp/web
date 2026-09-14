'use client'

import { AccountSuspendedBanner } from './AccountSuspendedBanner'
import { EmailVerificationBanner } from './EmailVerificationBanner'

/** Cross-layout account notices: suspension first, then email verification. */
export function AppStatusBanners() {
  return (
    <>
      <AccountSuspendedBanner />
      <EmailVerificationBanner />
    </>
  )
}
