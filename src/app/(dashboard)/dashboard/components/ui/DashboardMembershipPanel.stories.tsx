import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { storyMembership } from '@/app/(auth)/helpers/authStoryFixtures'

import { DashboardMembershipPanel } from './DashboardMembershipPanel'

const meta = {
  title: 'Dashboard/Home/DashboardMembershipPanel',
  component: DashboardMembershipPanel,
  parameters: { layout: 'padded' },
  args: { membership: storyMembership('free') },
} satisfies Meta<typeof DashboardMembershipPanel>

export default meta
type Story = StoryObj<typeof meta>

/** Worker on the free plan: the membership card with its usage meter. */
export const FreePlan: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('progressbar'),
    ).toBeVisible()
  },
}

/** Worker with unlimited quotes: the card without a meter. */
export const UnlimitedPlan: Story = {
  args: { membership: storyMembership('trial') },
}

/** Worker whose plan is set to cancel: the card carries the notice. */
export const Cancelling: Story = {
  args: { membership: storyMembership('activeCancelling') },
}

/** Customer with no worker profile: explains membership and offers to become a worker. */
export const NotAWorker: Story = {
  args: { membership: null },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', {
        name: 'Become a worker',
      }),
    ).toBeVisible()
  },
}

/** Membership not loaded yet (undefined) falls back to the same prompt. */
export const NotLoaded: Story = {
  args: { membership: undefined },
}
