import { WorkerSubscriptionStatus } from '@codegen/schema'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { isQuoteLimitReached } from '@/app/(dashboard)/helpers/workerMembershipHelpers'
import { isWorkerSetupComplete } from '@/app/(stepflow)/worker/setup/helpers/workerSetupEligibility'

/** Why a worker can't quote right now (My Tasks' "Before you can quote"). */
export type QuoteBlocker = 'finishSetup' | 'fixPayment' | 'quotesUsed'

/** Null for customers and for workers who can quote. */
export function quoteBlocker(me: MeSnapshot | null): QuoteBlocker | null {
  const worker = me?.worker
  if (!me || !worker) return null
  if (!isWorkerSetupComplete(me)) return 'finishSetup'
  // Slashie Pro is the account's (BE-145); null until it loads.
  const membership = me.membership
  if (!membership) return null
  const status = membership.subscriptionStatus
  if (
    status === WorkerSubscriptionStatus.PastDue ||
    status === WorkerSubscriptionStatus.Unpaid
  ) {
    return 'fixPayment'
  }
  return isQuoteLimitReached(membership) ? 'quotesUsed' : null
}
