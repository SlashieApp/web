import { LoginMethod } from '@codegen/schema'

import { getPostHog, initPostHogClient } from './posthog-client'

type IdentifyInput = {
  id: string
  emailVerified?: boolean
  phoneVerified?: boolean
  workerEligibility?: boolean
  enabledLoginMethods?: LoginMethod[]
  workerId?: string | null
}

export function identifyUser(user: IdentifyInput | null | undefined): void {
  try {
    if (!user?.id || typeof window === 'undefined') return
    initPostHogClient()
    const ph = getPostHog()
    if (!ph) return

    const methods = user.enabledLoginMethods ?? []
    ph.identify(user.id, {
      is_worker: Boolean(user.workerId),
      worker_eligible: user.workerEligibility === true,
      email_verified: user.emailVerified === true,
      phone_verified: user.phoneVerified === true,
      has_google_login: methods.includes(LoginMethod.Google),
      has_password_login: methods.includes(LoginMethod.Password),
    })
  } catch {
    // Never throw from analytics.
  }
}

export function resetAnalyticsIdentity(): void {
  try {
    if (typeof window === 'undefined') return
    const ph = getPostHog()
    ph?.reset()
  } catch {
    // no-op
  }
}
