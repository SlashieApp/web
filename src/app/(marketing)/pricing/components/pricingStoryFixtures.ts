import {
  Currency,
  LoginMethod,
  UserLanguage,
  WorkerSubscriptionStatus,
} from '@codegen/schema'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'
import { AUTH_COOKIE_NAME } from '@/utils/auth'

import type { PricingRecord } from '../helpers/getPricingForPage'

/** What the live API returns: £19.99 a month, a 180-day trial, 3 free quotes. */
export const storyPricing: PricingRecord = {
  productName: 'Slashie Unlimited',
  priceAmount: 1999,
  priceCurrency: 'gbp',
  priceInterval: 'month',
  trialDays: 180,
  trialLabel: '6 months free',
  freeQuotesPerMonth: 3,
}

type Membership = NonNullable<MeSnapshot['worker']>['membership']

/** A free worker who has never subscribed (`NONE`). */
export const freeMembership: Membership = {
  planName: 'Free',
  statusLabel: 'Free',
  subscriptionStatus: WorkerSubscriptionStatus.None,
  hasUnlimitedQuotes: false,
  cancelAtPeriodEnd: false,
  freeQuotesPerMonth: 3,
  quotesUsedThisMonth: 1,
  quotesRemainingThisMonth: 2,
  canStartTrial: true,
  canManageBilling: false,
  canUpgrade: true,
}

/**
 * Signed-in snapshot with only what pricing reads. `worker: null` is a
 * customer; `setupComplete: false` is a worker who hasn't finished setup.
 */
export function buildStoryMe(
  worker: { membership: Membership; setupComplete: boolean } | null,
): MeSnapshot {
  return {
    id: 'user-1',
    email: 'sam@example.com',
    disabled: false,
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    enabledLoginMethods: [LoginMethod.Password],
    workerEligibility: worker !== null,
    profile: { name: 'Sam Carter', emailVerified: true, phoneVerified: true },
    settings: {
      isProfilePrivate: false,
      language: UserLanguage.En,
      marketingEmails: false,
    },
    worker: worker && {
      id: 'worker-1',
      skills: [],
      qualifications: [],
      portfolioUrls: [],
      isVerified: true,
      preferredLocation: {},
      setupProgress: {
        currentSubStep: worker.setupComplete ? 'done' : 'profile',
        completedSubSteps: [],
        isComplete: worker.setupComplete,
      },
      membership: worker.membership,
      earnings: { pending: { amount: 0, currency: Currency.Gbp } },
    },
  }
}

/**
 * Story-only session: `document.cookie` reports the auth cookie (or none) on
 * this page only, `me` is seeded, and `getUser` never settles (no network from
 * Storybook). Real cookies are shared by every test file running at once, so
 * setting one could flip other stories. Returns the cleanup.
 */
export function stubSession(token: string | null, me: MeSnapshot | null) {
  const { getUser } = useUserStore.getState()
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get: () => (token ? `${AUTH_COOKIE_NAME}=${token}` : ''),
    set: () => {},
  })
  useUserStore.setState({
    user: me && { id: me.id, email: me.email, createdAt: me.createdAt },
    me,
    getUser: () => new Promise(() => {}),
  })
  return () => {
    Reflect.deleteProperty(document, 'cookie')
    useUserStore.setState({ user: null, me: null, getUser })
  }
}
