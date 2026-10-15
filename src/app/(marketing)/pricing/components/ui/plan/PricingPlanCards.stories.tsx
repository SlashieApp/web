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

import type { PricingRecord } from '../../../helpers/getPricingForPage'
import { PricingPlanCards } from './PricingPlanCards'

const pricing: PricingRecord = {
  productName: 'Slashie Unlimited',
  description: 'For active workers who quote every week',
  priceAmount: 999,
  priceCurrency: 'gbp',
  priceInterval: 'month',
  trialDays: 30,
  trialLabel: 'Free for 30 days',
  freeQuotesPerMonth: 3,
  stripePriceId: 'price_storybook',
  stripeProductId: 'prod_storybook',
}

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
  planName: 'Slashie Unlimited',
  statusLabel: 'Active',
  subscriptionStatus: WorkerSubscriptionStatus.Active,
  hasUnlimitedQuotes: true,
  cancelAtPeriodEnd: false,
  freeQuotesPerMonth: 3,
  quotesUsedThisMonth: 0,
  quotesRemainingThisMonth: 3,
  canStartTrial: false,
  canManageBilling: true,
  canUpgrade: false,
}

/** Signed-in snapshot with only what the plan cards read; `null` = customer. */
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

/** Signed-in session the CTAs read: an auth cookie plus `me`. Returns the cleanup. */
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

const meta = {
  title: 'Marketing/Pricing/PricingPlanCards',
  component: PricingPlanCards,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    pricing,
    copy: pricingBag.en.plans,
  },
  // Every story starts signed out; signed-in stories seed their own session.
  beforeEach: signOut,
} satisfies Meta<typeof PricingPlanCards>

export default meta
type Story = StoryObj<typeof meta>

/** Signed-out visitor with a live trial: Get started on Free, Upgrade on Unlimited. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('link', { name: 'Get started' }),
    ).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Upgrade' })).toBeVisible()
  },
}

/** No trial reported: the premium card falls back to the generic "Free trial" headline. */
export const WithoutTrialLabel: Story = {
  args: { pricing: { ...pricing, trialLabel: null, trialDays: null } },
}

/** No product description: the premium card shows the fallback subtitle. */
export const WithoutDescription: Story = {
  args: { pricing: { ...pricing, description: null } },
}

/** Yearly billing: the after-trial line reads "per year" with the yearly amount. */
export const YearlyBilling: Story = {
  args: {
    pricing: { ...pricing, priceAmount: 9900, priceInterval: 'year' },
  },
}

/** A larger free allowance (5 quotes) flows into the badge and the feature list. */
export const MoreFreeQuotes: Story = {
  args: { pricing: { ...pricing, freeQuotesPerMonth: 5 } },
}

/** Signed in without a worker profile: the premium card asks them to set one up. */
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

/** Signed-in worker on the free plan: Free shows a disabled Current plan, Unlimited offers Upgrade. */
export const SignedInWorkerFree: Story = {
  beforeEach: () => signInAs(buildMe(freeMembership)),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('button', { name: 'Current plan' }),
    ).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Upgrade' })).toBeEnabled()
  },
}

/** Signed-in worker on Unlimited: the premium card shows a disabled Current plan. */
export const SignedInWorkerUnlimited: Story = {
  beforeEach: () => signInAs(buildMe(unlimitedMembership)),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('button', { name: 'Current plan' }),
    ).toBeDisabled()
  },
}

/** Phone width: the two cards stack and the ribbon sits above the heading. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: {
    copy: pricingBag.zh_hk.plans,
    pricing: { ...pricing, trialLabel: '免費試用 30 日' },
  },
}
