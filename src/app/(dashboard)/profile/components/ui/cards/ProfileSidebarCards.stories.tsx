import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe, storyWorkerMe } from '@/app/(auth)/helpers/authStoryFixtures'

import { NextStepCard, PrivacyVisibilityCard } from './ProfileSidebarCards'

const meta = {
  title: 'Dashboard/Profile/ProfileSidebarCards',
  component: PrivacyVisibilityCard,
  parameters: { layout: 'padded' },
  args: { me: storyMe() },
  decorators: [withSession({ me: storyMe() })],
} satisfies Meta<typeof PrivacyVisibilityCard>

export default meta
type Story = StoryObj<typeof meta>

/** Visibility, public: the switch is off and says people can open the profile. */
export const VisibilityPublic: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('checkbox', { name: 'Private profile' }),
    ).not.toBeChecked()
    await expect(
      canvas.getByText('People can find and open your public profile.'),
    ).toBeVisible()
  },
}

/** Visibility, private: the switch is on and says only you can see it. */
export const VisibilityPrivate: Story = {
  args: { me: storyWorkerMe({ settings: { isProfilePrivate: true } }) },
  decorators: [
    withSession({
      me: storyWorkerMe({ settings: { isProfilePrivate: true } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('checkbox', { name: 'Private profile' }),
    ).toBeChecked()
    await expect(
      canvas.getByText('Only you can see your profile.'),
    ).toBeVisible()
  },
}

/** Visibility while suspended: the switch is disabled. */
export const VisibilitySuspended: Story = {
  args: { me: storyMe({ disabled: true }) },
  decorators: [withSession({ me: storyMe({ disabled: true }) })],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('checkbox', {
        name: 'Private profile',
      }),
    ).toBeDisabled()
  },
}

/** Next step, unfinished setup: Continue setup goes back to worker setup. */
export const NextStepContinueSetup: Story = {
  render: () => <NextStepCard step="continueSetup" />,
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', {
        name: 'Continue setup',
      }),
    ).toHaveAttribute('href', expect.stringContaining('/worker/setup'))
  },
}

/** Next step, phone not verified: Verify phone opens the phone row on Account. */
export const NextStepVerifyPhone: Story = {
  render: () => <NextStepCard step="verifyPhone" />,
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', { name: 'Verify phone' }),
    ).toHaveAttribute('href', '/account#contact')
  },
}
