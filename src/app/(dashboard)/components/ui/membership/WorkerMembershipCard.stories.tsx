import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { storyMembership } from '@/app/(auth)/helpers/authStoryFixtures'

import { WorkerMembershipCard } from './WorkerMembershipCard'

const meta = {
  title: 'Dashboard/Shared/WorkerMembershipCard',
  component: WorkerMembershipCard,
  parameters: { layout: 'padded' },
  args: { membership: storyMembership('free') },
} satisfies Meta<typeof WorkerMembershipCard>

export default meta
type Story = StoryObj<typeof meta>

/** Free plan with quotes left: the usage meter and a manage billing link. */
export const Free: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole('progressbar')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Manage billing' }),
    ).toBeVisible()
  },
}

/** Free plan, every quote used this month. */
export const FreeLimitReached: Story = {
  args: { membership: storyMembership('freeLimitReached') },
}

/** Free trial: unlimited quotes, so no meter. */
export const Trial: Story = {
  args: { membership: storyMembership('trial') },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('progressbar')).toBeNull()
  },
}

/** Paid and active. */
export const Active: Story = {
  args: { membership: storyMembership('active') },
}

/** Trial set to cancel: a notice with the end date above the card. */
export const TrialCancelling: Story = {
  args: { membership: storyMembership('trialCancelling') },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Subscription cancelling'),
    ).toBeVisible()
  },
}

/** Paid plan set to cancel. */
export const ActiveCancelling: Story = {
  args: { membership: storyMembership('activeCancelling') },
}

/** Payment past due: warning copy and the meter returns. */
export const PastDue: Story = {
  args: { membership: storyMembership('pastDue') },
}

/** Invoice unpaid: danger badge. */
export const Unpaid: Story = {
  args: { membership: storyMembership('unpaid') },
}

/** Subscription ended: back on the free plan. */
export const Canceled: Story = {
  args: { membership: storyMembership('canceled') },
}

/** Nothing to manage or upgrade: the link reads View billing. */
export const ViewOnly: Story = {
  args: {
    membership: storyMembership('canceled', {
      canManageBilling: false,
      canUpgrade: false,
    }),
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', { name: 'View billing' }),
    ).toBeVisible()
  },
}

/** A long plan name wraps beside the badge. */
export const LongPlanName: Story = {
  args: {
    membership: storyMembership('active', {
      planName: 'Slashie Unlimited for founding workers (annual billing)',
    }),
  },
}

/** Phones: the billing button fills the width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  args: { membership: storyMembership('trialCancelling') },
}
