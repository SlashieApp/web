import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { storyMembership } from '@/app/(auth)/helpers/authStoryFixtures'

import { MembershipStatusBadge } from './MembershipStatusBadge'

const meta = {
  title: 'Dashboard/Shared/MembershipStatusBadge',
  component: MembershipStatusBadge,
  parameters: { layout: 'padded' },
  args: { membership: storyMembership('free') },
} satisfies Meta<typeof MembershipStatusBadge>

export default meta
type Story = StoryObj<typeof meta>

/** Free plan: neutral chip. */
export const Free: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByLabelText('Membership status: Free'),
    ).toBeVisible()
  },
}

/** Free trial running: success chip. */
export const Trial: Story = {
  args: { membership: storyMembership('trial') },
}

/** Paid and active: success chip. */
export const Active: Story = {
  args: { membership: storyMembership('active') },
}

/** Set to cancel at the period end: warning chip. */
export const Cancelling: Story = {
  args: { membership: storyMembership('activeCancelling') },
}

/** Payment failed, past due: warning chip. */
export const PastDue: Story = {
  args: { membership: storyMembership('pastDue') },
}

/** Invoice unpaid: danger chip. */
export const Unpaid: Story = {
  args: { membership: storyMembership('unpaid') },
}

/** Subscription ended: neutral chip. */
export const Canceled: Story = {
  args: { membership: storyMembership('canceled') },
}
