import { WorkerSubscriptionStatus } from '@codegen/schema'

import type { WorkerMembershipSnapshot } from '@/app/(dashboard)/helpers/workerMembershipHelpers'

import type { PricingView } from './types'

export type PricingViewInput = {
  /** The API returned plans. */
  available: boolean
  /** From the session cookie (server), then the signed-in profile. */
  session: 'guest' | 'checking' | 'signedIn'
  /**
   * The signed-in viewer's worker profile; null for customers. `membership`
   * is the account's (`me.membership`, BE-145); null while it loads.
   */
  worker: {
    setupComplete: boolean
    membership: Pick<
      WorkerMembershipSnapshot,
      | 'hasPro'
      | 'canUpgrade'
      | 'canStartTrial'
      | 'canManageBilling'
      | 'cancelAtPeriodEnd'
      | 'subscriptionStatus'
    > | null
  } | null
}

/**
 * Plans first, then the session, then the worker's membership, in Billing's
 * order (`getBillingView`), so the two pages always say the same thing
 * (FE-290). It reads the API's flags first and the status only to tell apart
 * what the flags can't: a trial, payment trouble, paused, unfinished.
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
  const m = worker.membership
  // The account's membership hasn't loaded: placeholders, as for the session.
  if (!m) return 'checkingSession'
  if (m.hasPro) {
    if (m.cancelAtPeriodEnd) {
      // No Stripe plan to keep: Slashie Pro given until a date (BE-119).
      return m.canManageBilling ? 'workerCancelling' : 'workerGivenUntil'
    }
    // No Stripe plan and no end: given by Slashie (BE-117).
    if (!m.canManageBilling) return 'workerGiven'
    return m.subscriptionStatus === WorkerSubscriptionStatus.Trialing
      ? 'workerTrialing'
      : 'workerUnlimited'
  }
  switch (m.subscriptionStatus) {
    case WorkerSubscriptionStatus.PastDue:
    case WorkerSubscriptionStatus.Unpaid:
      return 'workerPaymentProblem'
    case WorkerSubscriptionStatus.Paused:
      return 'workerPaused'
    case WorkerSubscriptionStatus.Incomplete:
      return 'workerIncomplete'
  }
  if (!worker.setupComplete) return 'workerSetup'
  if (m.canUpgrade) {
    return m.canStartTrial ? 'workerFree' : 'workerLapsed'
  }
  return 'workerBilling'
}
