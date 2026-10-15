import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { storyMembership } from '@/app/(auth)/helpers/authStoryFixtures'

import { MembershipCancelNotice } from './MembershipCancelNotice'

const meta = {
  title: 'Dashboard/Shared/MembershipCancelNotice',
  component: MembershipCancelNotice,
  parameters: { layout: 'padded' },
  args: { membership: storyMembership('activeCancelling') },
} satisfies Meta<typeof MembershipCancelNotice>

export default meta
type Story = StoryObj<typeof meta>

/** Paid plan set to cancel: unlimited quotes until the period ends. */
export const PaidCancelling: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Subscription cancelling'),
    ).toBeVisible()
    await expect(canvasElement).toHaveTextContent('9 Jan 2027')
  },
}

/** Free trial set to cancel: the end date is the trial end. */
export const TrialCancelling: Story = {
  args: { membership: storyMembership('trialCancelling') },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Subscription cancelling'),
    ).toBeVisible()
    await expect(canvasElement).toHaveTextContent('9 Dec 2026')
  },
}

/** Not cancelling: nothing is shown. */
export const NotCancelling: Story = {
  args: { membership: storyMembership('active') },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText('Subscription cancelling'),
    ).toBeNull()
  },
}

/** Cancelling but the API sent no end date: nothing is shown. */
export const NoEndDate: Story = {
  args: {
    membership: storyMembership('activeCancelling', {
      currentPeriodEnd: null,
      trialEndsAt: null,
    }),
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText('Subscription cancelling'),
    ).toBeNull()
  },
}
