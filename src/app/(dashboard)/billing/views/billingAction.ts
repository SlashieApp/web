import type { WorkerMembershipSnapshot } from '@/app/(dashboard)/helpers/workerMembershipHelpers'

import type { BillingAction } from './types'

type ActionMembership = Pick<
  WorkerMembershipSnapshot,
  'canManageBilling' | 'canUpgrade'
> | null

/**
 * The view's button, from what the API allows (BE-119). Manage billing and
 * Keep open the Stripe portal, which needs a Stripe plan (`canManageBilling`).
 * Unlimited given by Slashie has none: until a date, Keep starts Checkout
 * instead (`canUpgrade`; the first charge is on that date); with no end there
 * is no button.
 */
export function billingActionFor(
  action: BillingAction | null,
  membership: ActionMembership,
): BillingAction | null {
  if (!membership) return action
  switch (action) {
    case 'manageBilling':
      return membership.canManageBilling ? action : null
    case 'keepUnlimited':
      return membership.canManageBilling || membership.canUpgrade
        ? action
        : null
    default:
      return action
  }
}

/** Keep opens the portal for a Stripe plan, else Checkout (BE-119). */
export function keepUnlimitedOpens(
  membership: ActionMembership,
): 'portal' | 'checkout' {
  return membership?.canManageBilling === false && membership.canUpgrade
    ? 'checkout'
    : 'portal'
}
