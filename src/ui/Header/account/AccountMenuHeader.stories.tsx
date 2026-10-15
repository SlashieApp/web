import { Box } from '@chakra-ui/react'
import {
  type WorkerMembershipFieldsFragment as Membership,
  WorkerSubscriptionStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { fn } from 'storybook/test'

import { useUserStore } from '@/app/(auth)/store/user'

import { AccountMenuHeader } from './AccountMenuHeader'

/** Worker on the 6-month trial: unlimited quotes, billing is manageable. */
const trial: Membership = {
  planName: 'Slashie Unlimited',
  statusLabel: 'Trial',
  statusDescription: 'Unlimited quotes until 9 Dec 2026',
  subscriptionStatus: WorkerSubscriptionStatus.Trialing,
  hasUnlimitedQuotes: true,
  cancelAtPeriodEnd: false,
  canceledAt: null,
  freeQuotesPerMonth: 3,
  quotesUsedThisMonth: 0,
  quotesRemainingThisMonth: 3,
  trialEndsAt: '2026-12-09T00:00:00.000Z',
  currentPeriodEnd: '2026-12-09T00:00:00.000Z',
  canStartTrial: false,
  canManageBilling: true,
  canUpgrade: false,
}

/** Worker on the free plan: capped quotes, upgrade offered. */
const free: Membership = {
  ...trial,
  planName: 'Free',
  statusLabel: 'Free',
  statusDescription: null,
  subscriptionStatus: WorkerSubscriptionStatus.None,
  hasUnlimitedQuotes: false,
  quotesUsedThisMonth: 2,
  quotesRemainingThisMonth: 1,
  trialEndsAt: null,
  canManageBilling: false,
  canUpgrade: true,
}

const meta = {
  title: 'Shell/Header/AccountMenuHeader',
  component: AccountMenuHeader,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    displayName: 'Sam Carter',
    email: 'sam@example.com',
    hasWorker: true,
    membership: trial,
    onViewProfile: fn(),
  },
  // The avatar reads the signed-in profile photo, so start from signed out.
  decorators: [
    (Story) => {
      useUserStore.setState({ user: null, me: null })
      return (
        <Box
          w="300px"
          bg="bg.surface"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="lg"
          boxShadow="e3"
          overflow="hidden"
        >
          <Story />
        </Box>
      )
    },
  ],
} satisfies Meta<typeof AccountMenuHeader>

export default meta
type Story = StoryObj<typeof meta>

/** Trial: unlimited quotes with the trial end date and a Manage billing link. */
export const WorkerOnTrial: Story = {}

/** Active plan: paying subscriber, shows the renewal date and Manage billing. */
export const WorkerActivePlan: Story = {
  args: {
    membership: {
      ...trial,
      statusLabel: 'Active',
      statusDescription: null,
      subscriptionStatus: WorkerSubscriptionStatus.Active,
      trialEndsAt: null,
      currentPeriodEnd: '2027-01-09T00:00:00.000Z',
    },
  },
}

/** Cancel scheduled: warning badge and the date the plan ends. */
export const WorkerCancelScheduled: Story = {
  args: {
    membership: {
      ...trial,
      statusLabel: 'Ending',
      statusDescription: null,
      subscriptionStatus: WorkerSubscriptionStatus.Active,
      cancelAtPeriodEnd: true,
      trialEndsAt: null,
      currentPeriodEnd: '2027-01-09T00:00:00.000Z',
    },
  },
}

/** Payment failed: danger badge, quota meter at its limit and Manage billing. */
export const WorkerPaymentFailed: Story = {
  args: {
    membership: {
      ...free,
      planName: 'Slashie Unlimited',
      statusLabel: 'Payment due',
      subscriptionStatus: WorkerSubscriptionStatus.Unpaid,
      quotesUsedThisMonth: 3,
      quotesRemainingThisMonth: 0,
      canManageBilling: true,
      canUpgrade: false,
    },
  },
}

/** Free plan: neutral badge, quota meter (2 of 3 used) and an Upgrade link. */
export const WorkerFreePlan: Story = {
  args: { membership: free },
}

/** Free plan, quota used up: the meter is full at 3 of 3. */
export const WorkerFreeQuotaUsedUp: Story = {
  args: {
    membership: {
      ...free,
      quotesUsedThisMonth: 3,
      quotesRemainingThisMonth: 0,
    },
  },
}

/** Customer: no worker profile, so the card pitches posting for free and becoming a worker. */
export const Customer: Story = {
  args: { hasWorker: false, membership: undefined },
}

/** Long text: a long name and email truncate with an ellipsis instead of wrapping. */
export const LongNameAndEmail: Story = {
  args: {
    displayName: 'Alexandria Montgomery-Featherstonehaugh',
    email:
      'alexandria.montgomery-featherstonehaugh@a-very-long-company-domain.example.com',
  },
}
