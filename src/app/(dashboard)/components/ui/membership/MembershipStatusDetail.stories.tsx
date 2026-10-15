import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { storyMembership } from '@/app/(auth)/helpers/authStoryFixtures'

import { MembershipStatusDetail } from './MembershipStatusDetail'

const meta = {
  title: 'Dashboard/Shared/MembershipStatusDetail',
  component: MembershipStatusDetail,
  parameters: { layout: 'padded' },
  args: { membership: storyMembership('trial') },
} satisfies Meta<typeof MembershipStatusDetail>

export default meta
type Story = StoryObj<typeof meta>

/** Trial: unlimited quotes, with the trial end date. */
export const TrialUnlimited: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent(
      /Unlimited quotes.+trial ends 9 Dec 2026\./,
    )
  },
}

/** Paid and active: unlimited quotes, with the renewal date. */
export const ActiveRenews: Story = {
  args: { membership: storyMembership('active') },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent(
      /Unlimited quotes.+renews on 9 Jan 2027\./,
    )
  },
}

/** Unlimited with no date from the API. */
export const UnlimitedNoDate: Story = {
  args: {
    membership: storyMembership('active', { currentPeriodEnd: null }),
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent(
      'Unlimited quotes while your subscription is active.',
    )
  },
}

/** The API sends its own description: it wins over the computed one. */
export const ApiDescription: Story = {
  args: {
    membership: storyMembership('trial', {
      statusDescription: 'Your 6-month free trial is running',
    }),
  },
}

/** Set to cancel: the warning names the end date. */
export const CancelScheduled: Story = {
  args: { membership: storyMembership('activeCancelling') },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent('Cancels on 9 Jan 2027')
  },
}

/** Set to cancel with no end date from the API: the generic "until it ends" line. */
export const CancelScheduledNoDate: Story = {
  args: {
    membership: storyMembership('activeCancelling', {
      currentPeriodEnd: null,
      trialEndsAt: null,
    }),
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent(
      'Unlimited quotes until your subscription ends.',
    )
  },
}

/** Payment past due: update the payment method. */
export const PastDue: Story = {
  args: { membership: storyMembership('pastDue') },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent('Payment issue')
  },
}

/** Invoice unpaid: update billing. */
export const Unpaid: Story = {
  args: { membership: storyMembership('unpaid') },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent('Payment required')
  },
}

/** Subscription ended: back on the free plan. */
export const Canceled: Story = {
  args: { membership: storyMembership('canceled') },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent('has ended')
  },
}

/** Free plan with a description from the API. */
export const FreeWithDescription: Story = {
  args: {
    membership: storyMembership('free', {
      statusDescription: '1 of 3 free quotes used this month',
    }),
  },
}

/** Free plan with nothing to add: nothing is shown. */
export const FreeNothingToAdd: Story = {
  args: { membership: storyMembership('free') },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByText(/./)).toBeNull()
  },
}
