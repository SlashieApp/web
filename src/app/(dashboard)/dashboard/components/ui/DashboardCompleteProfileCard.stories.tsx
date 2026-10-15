import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyMe,
  storyWorker,
  storyWorkerDraft,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'

import { DashboardCompleteProfileCard } from './DashboardCompleteProfileCard'

const meta = {
  title: 'Dashboard/Home/DashboardCompleteProfileCard',
  component: DashboardCompleteProfileCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof DashboardCompleteProfileCard>

export default meta
type Story = StoryObj<typeof meta>

/** Customer with no worker profile: 1 of 5 done, the link continues setup. */
export const Customer: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('1/5 complete')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Continue setup' }),
    ).toBeVisible()
  },
}

/** Worker setup half done: most steps ticked, still pointing at setup. */
export const SetupInProgress: Story = {
  decorators: [
    withSession({
      me: storyMe({
        profile: { contactNumber: '+447700900123' },
        worker: storyWorkerDraft(),
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('4/5 complete')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Continue setup' }),
    ).toBeVisible()
  },
}

/** Everything done: 100% and the link goes to Profile instead. */
export const Complete: Story = {
  decorators: [withSession({ me: storyWorkerMe() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('5/5 complete')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Manage profile' }),
    ).toBeVisible()
  },
}

/** Setup complete but a profile field is still empty: Manage profile, under 100%. */
export const CompleteWithGaps: Story = {
  decorators: [
    withSession({
      me: storyWorkerMe({
        worker: storyWorker({ tagline: null, locationAddress: null }),
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('3/5 complete'),
    ).toBeVisible()
  },
}

/** Signed out: the card is not shown. */
export const SignedOut: Story = {
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByText('Complete your profile'),
    ).toBeNull()
  },
}
