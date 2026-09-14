'use client'

import { EmailVerificationBanner } from './EmailVerificationBanner'
import { SuspensionBanner } from './SuspensionBanner'

/**
 * Session status strips shown above app chrome on every authenticated layout
 * (Header + step-flow). Suspension takes precedence visually by rendering first.
 */
export function AccountStatusBanners() {
  return (
    <>
      <SuspensionBanner />
      <EmailVerificationBanner />
    </>
  )
}
