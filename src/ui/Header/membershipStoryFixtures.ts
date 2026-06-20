import type { MeSnapshot } from '@/app/(auth)/store/user'
import { StoryWorkerSubscriptionStatus } from '@/storybook/storyLiterals'

export type StoryMembership = NonNullable<
  NonNullable<MeSnapshot['worker']>['membership']
>

const baseMembership: StoryMembership = {
  planName: 'Slashie Unlimited',
  statusLabel: 'Active',
  statusDescription: null,
  subscriptionStatus: StoryWorkerSubscriptionStatus.Active,
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

export const membershipFixtureFree: StoryMembership = {
  ...baseMembership,
  planName: 'Free',
  statusLabel: 'Free',
  subscriptionStatus: StoryWorkerSubscriptionStatus.None,
  hasUnlimitedQuotes: false,
  quotesUsedThisMonth: 2,
  quotesRemainingThisMonth: 1,
  canManageBilling: false,
  canUpgrade: true,
}

export const membershipFixtureTrial: StoryMembership = {
  ...baseMembership,
  statusLabel: 'Trial',
  statusDescription: 'Unlimited quotes until 9 Dec 2026',
  subscriptionStatus: StoryWorkerSubscriptionStatus.Trialing,
  trialEndsAt: '2026-12-09T00:00:00.000Z',
  canManageBilling: true,
  canUpgrade: false,
}

export const membershipFixtureActive: StoryMembership = {
  ...baseMembership,
  statusLabel: 'Active',
  statusDescription: 'Renews on 9 Dec 2026',
}

export const membershipFixtureCanceled: StoryMembership = {
  ...baseMembership,
  statusLabel: 'Canceled',
  statusDescription: 'Unlimited quotes until 9 Dec 2026',
  subscriptionStatus: StoryWorkerSubscriptionStatus.Active,
  cancelAtPeriodEnd: true,
  hasUnlimitedQuotes: true,
  trialEndsAt: null,
  currentPeriodEnd: '2026-12-09T00:00:00.000Z',
}
