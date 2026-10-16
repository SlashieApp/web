import { WorkerSubscriptionStatus } from '@codegen/schema'

import type { BillingView, BillingViewInput } from './types'

/**
 * Picks the Billing view from the API's membership flags (the same ones
 * /pricing reads) plus the Checkout return. Status only tells apart states
 * the flags can't: trial vs paid, payment trouble, paused, unfinished.
 */
export function getBillingView({
  worker,
  pricing,
  checkout,
}: BillingViewInput): BillingView {
  if (!worker) return 'customer'
  const m = worker.membership
  if (!m.hasUnlimitedQuotes && checkout === 'returning') return 'activating'
  if (!m.hasUnlimitedQuotes && checkout === 'delayed') {
    return 'activationDelayed'
  }
  if (m.hasUnlimitedQuotes) {
    if (m.cancelAtPeriodEnd) return 'cancelling'
    return m.subscriptionStatus === WorkerSubscriptionStatus.Trialing
      ? 'trialing'
      : 'subscribed'
  }
  switch (m.subscriptionStatus) {
    case WorkerSubscriptionStatus.PastDue:
    case WorkerSubscriptionStatus.Unpaid:
      return 'paymentProblem'
    case WorkerSubscriptionStatus.Paused:
      return 'paused'
    case WorkerSubscriptionStatus.Incomplete:
      return 'incomplete'
  }
  if (!worker.setupComplete) return 'workerSetup'
  if (pricing === 'loading') return 'loading'
  if (pricing === 'failed') return 'priceUnavailable'
  // The API offers an upgrade on every free status; lapsed means no trial.
  return m.canUpgrade && !m.canStartTrial ? 'lapsed' : 'free'
}
