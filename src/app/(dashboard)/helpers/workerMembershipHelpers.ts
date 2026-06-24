import type { WorkerMembershipFieldsFragment } from '@codegen/schema'
import { WorkerSubscriptionStatus } from '@codegen/schema'

export type WorkerMembershipSnapshot = WorkerMembershipFieldsFragment

export type MembershipBadgeVariant =
  | 'success'
  | 'warning'
  | 'neutral'
  | 'danger'

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

/** Free-tier cap reached — never true when unlimited quoting applies. */
export function isQuoteLimitReached(
  membership: WorkerMembershipSnapshot | null | undefined,
): boolean {
  if (!membership || hasUnlimitedQuoting(membership)) return false
  return membership.quotesRemainingThisMonth <= 0
}

/** Checkout return polling: membership reflects Stripe trial or paid sub. */
export function isMembershipSynced(
  membership: WorkerMembershipSnapshot | null | undefined,
): boolean {
  return hasUnlimitedQuoting(membership)
}

/** Prefer the snapshot that grants unlimited quoting when sources disagree. */
export function pickMembershipSnapshot(
  primary: WorkerMembershipSnapshot | null | undefined,
  secondary: WorkerMembershipSnapshot | null | undefined,
): WorkerMembershipSnapshot | null {
  if (!primary && !secondary) return null
  if (!primary) return secondary ?? null
  if (!secondary) return primary
  if (hasUnlimitedQuoting(primary) !== hasUnlimitedQuoting(secondary)) {
    return hasUnlimitedQuoting(primary) ? primary : secondary
  }
  return secondary
}

export function formatMembershipDate(
  value: string | null | undefined,
): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function isMembershipCancelScheduled(
  membership: WorkerMembershipSnapshot,
): boolean {
  return membership.cancelAtPeriodEnd
}

export function isMembershipCanceled(
  membership: WorkerMembershipSnapshot,
): boolean {
  return membership.subscriptionStatus === WorkerSubscriptionStatus.Canceled
}

export function isMembershipPaymentWarning(
  status: WorkerSubscriptionStatus,
): boolean {
  return (
    status === WorkerSubscriptionStatus.PastDue ||
    status === WorkerSubscriptionStatus.Unpaid
  )
}

/** @deprecated Use isMembershipPaymentWarning or isMembershipCanceled. */
export function isMembershipWarningStatus(
  status: WorkerSubscriptionStatus,
): boolean {
  return (
    isMembershipPaymentWarning(status) ||
    status === WorkerSubscriptionStatus.Canceled
  )
}

export function membershipBadgeVariant(
  membership: WorkerMembershipSnapshot,
): MembershipBadgeVariant {
  const status = membership.subscriptionStatus
  if (status === WorkerSubscriptionStatus.Unpaid) return 'danger'
  if (membership.cancelAtPeriodEnd || isMembershipPaymentWarning(status)) {
    return 'warning'
  }
  if (
    status === WorkerSubscriptionStatus.Trialing ||
    status === WorkerSubscriptionStatus.Active
  ) {
    return 'success'
  }
  return 'neutral'
}

export function membershipBadgeColorsFromVariant(
  variant: MembershipBadgeVariant,
): { bg: string; color: string } {
  switch (variant) {
    case 'success':
      return { bg: 'status.success.soft', color: 'status.success.fg' }
    case 'warning':
      return { bg: 'status.warning.soft', color: 'status.warning.fg' }
    case 'danger':
      return { bg: 'status.danger.soft', color: 'status.danger.fg' }
    default:
      /* TODO(sdl): verify role — neutral membership chip fallback */
      return { bg: 'bg.subtle', color: 'text.default' }
  }
}

export function membershipBadgeColors(membership: WorkerMembershipSnapshot): {
  bg: string
  color: string
} {
  return membershipBadgeColorsFromVariant(membershipBadgeVariant(membership))
}

/** End date for cancel-at-period-end subtitles. */
export function formatMembershipEndDate(
  membership: WorkerMembershipSnapshot,
): string | null {
  if (membership.cancelAtPeriodEnd) {
    if (membership.subscriptionStatus === WorkerSubscriptionStatus.Trialing) {
      return formatMembershipDate(membership.trialEndsAt)
    }
    if (membership.subscriptionStatus === WorkerSubscriptionStatus.Active) {
      return formatMembershipDate(membership.currentPeriodEnd)
    }
  }
  return formatMembershipDate(
    membership.trialEndsAt ?? membership.currentPeriodEnd,
  )
}

export function membershipUpgradeLabel(
  membership: WorkerMembershipSnapshot,
): string {
  if (isMembershipCanceled(membership) || !membership.canStartTrial) {
    return 'Resubscribe to Slashie Unlimited'
  }
  return 'Start 6-month free trial'
}

export function membershipStatusDetailText(
  membership: WorkerMembershipSnapshot,
): string | null {
  const fromApi = membership.statusDescription?.trim()
  if (fromApi) return fromApi

  const endDate = formatMembershipEndDate(membership)

  if (isMembershipCancelScheduled(membership) && endDate) {
    return `Cancels on ${endDate}`
  }

  if (isMembershipCanceled(membership)) {
    const ended = formatMembershipDate(membership.canceledAt)
    return ended
      ? `Your subscription ended on ${ended}`
      : 'Your subscription has ended'
  }

  if (
    membership.subscriptionStatus === WorkerSubscriptionStatus.Trialing &&
    membership.trialEndsAt
  ) {
    const trialEnd = formatMembershipDate(membership.trialEndsAt)
    return trialEnd ? `Trial ends ${trialEnd}` : null
  }

  if (
    membership.subscriptionStatus === WorkerSubscriptionStatus.Active &&
    membership.currentPeriodEnd
  ) {
    const renews = formatMembershipDate(membership.currentPeriodEnd)
    return renews ? `Renews on ${renews}` : null
  }

  if (
    membership.subscriptionStatus === WorkerSubscriptionStatus.None &&
    membership.canceledAt
  ) {
    const ended = formatMembershipDate(membership.canceledAt)
    return ended ? `Previous subscription ended on ${ended}` : null
  }

  return null
}

export function membershipCanceledBodyCopy(
  membership: WorkerMembershipSnapshot,
): string {
  const quotes = membership.freeQuotesPerMonth
  return `Your Slashie Unlimited subscription has ended. You're on the free plan (${quotes} quotes per month).`
}
