import type { WorkerMembershipFieldsFragment } from '@codegen/schema'
import { WorkerSubscriptionStatus } from '@codegen/schema'

const baseMembership: WorkerMembershipFieldsFragment = {
  planName: 'Slashie Unlimited',
  statusLabel: 'Active',
  statusDescription: null,
  subscriptionStatus: WorkerSubscriptionStatus.Active,
  hasUnlimitedQuotes: true,
  cancelAtPeriodEnd: false,
  canceledAt: null,
  freeQuotesPerMonth: 3,
  quotesUsedThisMonth: 0,
  quotesRemainingThisMonth: 3,
  trialEndsAt: null,
  currentPeriodEnd: '2026-12-09T00:00:00.000Z',
  canStartTrial: false,
  canManageBilling: true,
  canUpgrade: false,
}

export const membershipFixtureFree: WorkerMembershipFieldsFragment = {
  ...baseMembership,
  planName: 'Free',
  statusLabel: 'Free',
  subscriptionStatus: WorkerSubscriptionStatus.None,
  hasUnlimitedQuotes: false,
  quotesUsedThisMonth: 2,
  quotesRemainingThisMonth: 1,
  canManageBilling: false,
  canUpgrade: true,
}

export const membershipFixtureTrial: WorkerMembershipFieldsFragment = {
  ...baseMembership,
  statusLabel: 'Trial',
  statusDescription: 'Unlimited quotes until 9 Dec 2026',
  subscriptionStatus: WorkerSubscriptionStatus.Trialing,
  trialEndsAt: '2026-12-09T00:00:00.000Z',
  canManageBilling: true,
  canUpgrade: false,
}

export const membershipFixtureActive: WorkerMembershipFieldsFragment = {
  ...baseMembership,
  statusLabel: 'Active',
  statusDescription: 'Renews on 9 Dec 2026',
}

export const membershipFixtureCanceled: WorkerMembershipFieldsFragment = {
  ...baseMembership,
  statusLabel: 'Canceled',
  statusDescription: 'Unlimited quotes until 9 Dec 2026',
  subscriptionStatus: WorkerSubscriptionStatus.Active,
  cancelAtPeriodEnd: true,
  hasUnlimitedQuotes: true,
  trialEndsAt: null,
  currentPeriodEnd: '2026-12-09T00:00:00.000Z',
}
