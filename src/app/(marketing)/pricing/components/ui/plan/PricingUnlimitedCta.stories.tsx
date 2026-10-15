import {
  Currency,
  LoginMethod,
  UserLanguage,
  WorkerSubscriptionStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'
import pricingBag from '@/app/(marketing)/pricing/i11n.json'
import { AUTH_COOKIE_NAME } from '@/utils/auth'

import { PricingUnlimitedCta } from './PricingUnlimitedCta'

type Membership = NonNullable<NonNullable<MeSnapshot['worker']>['membership']>

const freeMembership: Membership = {
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

const unlimitedMembership: Membership = {
  ...freeMembership,
  planName: 'Slashie Unlimited',
  statusLabel: 'Active',
  subscriptionStatus: WorkerSubscriptionStatus.Active,
  hasUnlimitedQuotes: true,
  quotesUsedThisMonth: 0,
  quotesRemainingThisMonth: 3,
  canStartTrial: false,
  canManageBilling: true,
  canUpgrade: false,
}

/** Signed-in snapshot with only what the CTA reads; `null` = customer. */
function buildMe(membership: Membership | null): MeSnapshot {
  return {
    id: 'user-1',
    email: 'sam@example.com',
    disabled: false,
    emailVerified: true,
    phoneVerified: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    enabledLoginMethods: [LoginMethod.Password],
    workerEligibility: membership !== null,
    profile: { name: 'Sam Carter', emailVerified: true, phoneVerified: true },
    settings: {
      isProfilePrivate: false,
      language: UserLanguage.En,
      marketingEmails: false,
    },
    worker: membership && {
      id: 'worker-1',
      skills: [],
      qualifications: [],
      portfolioUrls: [],
      isVerified: true,
      preferredLocation: {},
      membership,
      earnings: { pending: { amount: 0, currency: Currency.Gbp } },
    },
  }
}

/**
 * Story-only: this page's `document.cookie` reports the auth cookie (or none).
 * Real cookies are shared by every test file running at the same time, so
 * setting or clearing one here could flip other stories between signed in and
 * signed out.
 */
function stubAuthCookie(token: string | null) {
  Object.defineProperty(document, 'cookie', {
    configurable: true,
    get: () => (token ? `${AUTH_COOKIE_NAME}=${token}` : ''),
    set: () => {},
  })
  return () => {
    Reflect.deleteProperty(document, 'cookie')
  }
}

/** Signed-out session: no auth cookie and no `me`. Returns the cleanup. */
function signOut() {
  const restoreCookie = stubAuthCookie(null)
  useUserStore.setState({ user: null, me: null })
  return () => {
    restoreCookie()
    useUserStore.setState({ user: null, me: null })
  }
}

/** Signed-in session the CTA reads: an auth cookie plus `me`. Returns the cleanup. */
function signInAs(me: MeSnapshot) {
  const restoreCookie = stubAuthCookie('storybook-token')
  useUserStore.setState({
    user: { id: me.id, email: me.email, createdAt: me.createdAt },
    me,
  })
  return () => {
    restoreCookie()
    useUserStore.setState({ user: null, me: null })
  }
}

// The Upgrade button starts a real checkout (it loads Stripe), so no story
// clicks it.
const meta = {
  title: 'Marketing/Pricing/PricingUnlimitedCta',
  component: PricingUnlimitedCta,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    copy: pricingBag.en.plans,
  },
  // Every story starts signed out; signed-in stories seed their own session.
  beforeEach: signOut,
} satisfies Meta<typeof PricingUnlimitedCta>

export default meta
type Story = StoryObj<typeof meta>

/** Signed-out visitor: Upgrade is a link that goes through sign-up first. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', { name: 'Upgrade' }),
    ).toHaveAttribute(
      'href',
      `/register?next=${encodeURIComponent('/billing')}`,
    )
  },
}

/** Signed in without a worker profile: the link sends them to worker setup. */
export const SignedInCustomer: Story = {
  beforeEach: () => signInAs(buildMe(null)),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('link', {
        name: 'Set up worker profile',
      }),
    ).toHaveAttribute('href', '/worker/setup')
  },
}

/** Signed-in worker on the free plan: Upgrade is a button that starts checkout. */
export const SignedInWorkerFree: Story = {
  beforeEach: () => signInAs(buildMe(freeMembership)),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Upgrade' }),
    ).toBeEnabled()
  },
}

/** Signed-in worker on Unlimited: a disabled Current plan button. */
export const CurrentPlan: Story = {
  beforeEach: () => signInAs(buildMe(unlimitedMembership)),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Current plan' }),
    ).toBeDisabled()
  },
}

/** Traditional Chinese labels. */
export const TraditionalChinese: Story = {
  args: { copy: pricingBag.zh_hk.plans },
}
