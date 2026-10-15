import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

import { AccountContactCard } from './AccountContactCard'

const PHONE = '+447700900123'

const meta = {
  title: 'Dashboard/Account/AccountContactCard',
  component: AccountContactCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AccountContactCard>

export default meta
type Story = StoryObj<typeof meta>

/** Email confirmed, phone saved but not confirmed. */
export const PhoneUnverified: Story = {
  decorators: [
    withSession({ me: storyMe({ profile: { contactNumber: PHONE } }) }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', { name: 'Verify' }),
    ).toBeVisible()
  },
}

/** Email and phone both confirmed. */
export const Verified: Story = {
  decorators: [
    withSession({
      me: storyMe({ phoneVerified: true, profile: { contactNumber: PHONE } }),
    }),
  ],
}

/** Nothing confirmed and no phone saved yet. */
export const NothingVerified: Story = {
  decorators: [withSession({ me: storyMe({ emailVerified: false }) })],
}

/** A new email is waiting for its link. */
export const EmailChangePending: Story = {
  decorators: [
    withSession({
      me: storyMe({
        phoneVerified: true,
        pendingEmail: 'sam.new@example.com',
        profile: { contactNumber: PHONE },
      }),
    }),
  ],
}
