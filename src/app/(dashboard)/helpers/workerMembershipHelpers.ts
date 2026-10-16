import type { WorkerMembershipFieldsFragment } from '@codegen/schema'
import { WorkerSubscriptionStatus } from '@codegen/schema'

export type WorkerMembershipSnapshot = WorkerMembershipFieldsFragment

/** Trust API `hasUnlimitedQuotes`; never grant unlimited to lapsed/canceled workers. */
export function hasUnlimitedQuoting(
  membership: WorkerMembershipSnapshot | null | undefined,
): boolean {
  if (!membership) return false
  if (membership.hasUnlimitedQuotes) return true
  if (
    membership.subscriptionStatus === WorkerSubscriptionStatus.Canceled ||
    membership.subscriptionStatus === WorkerSubscriptionStatus.None
  ) {
    return false
  }
  return (
    membership.subscriptionStatus === WorkerSubscriptionStatus.Trialing ||
    membership.subscriptionStatus === WorkerSubscriptionStatus.Active
  )
}

/** Free-tier cap reached; never true when unlimited quoting applies. */
export function isQuoteLimitReached(
  membership: WorkerMembershipSnapshot | null | undefined,
): boolean {
  if (!membership || hasUnlimitedQuoting(membership)) return false
  return membership.quotesRemainingThisMonth <= 0
}
