import type { WorkerMembershipSnapshot } from '@/app/(dashboard)/helpers/workerMembershipHelpers'

import type { PricingView } from './types'

export type PricingViewInput = {
  /** The API returned plans. */
  available: boolean
  /** From the session cookie (server), then the signed-in profile. */
  session: 'guest' | 'checking' | 'signedIn'
  /** The signed-in viewer's worker profile; null for customers. */
  worker: {
    setupComplete: boolean
    membership: Pick<
      WorkerMembershipSnapshot,
      'hasUnlimitedQuotes' | 'canUpgrade' | 'canStartTrial'
    >
  } | null
}

/**
 * Plans first, then the session, then the worker's membership. Membership
 * reads the API's flags, not the Stripe status, so pricing offers exactly what
 * Billing would.
 */
export function getPricingView({
  available,
  session,
  worker,
}: PricingViewInput): PricingView {
  if (!available) return 'unavailable'
  if (session === 'checking') return 'checkingSession'
  if (session === 'guest') return 'guest'
  if (!worker) return 'customer'
  const { membership } = worker
  if (membership.hasUnlimitedQuotes) return 'workerUnlimited'
  if (!worker.setupComplete) return 'workerSetup'
  if (membership.canUpgrade) {
    return membership.canStartTrial ? 'workerFree' : 'workerLapsed'
  }
  return 'workerBilling'
}
