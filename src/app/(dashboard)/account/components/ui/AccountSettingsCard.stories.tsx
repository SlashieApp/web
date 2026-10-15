import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'

import { STORY_VAPID_KEY, seedVapidKey } from '../accountStoryFixtures'
import { AccountSettingsCard } from './AccountSettingsCard'

const seed = seedVapidKey(STORY_VAPID_KEY)

const meta = {
  title: 'Dashboard/Account/AccountSettingsCard',
  component: AccountSettingsCard,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AccountSettingsCard>

export default meta
type Story = StoryObj<typeof meta>

const privateProfile = (canvas: ReturnType<typeof within>) =>
  canvas.findByRole('checkbox', { name: 'Private profile' })

/** Public profile, no marketing emails: both switches off. */
export const Default: Story = {
  decorators: [withSession({ me: storyMe(), seed })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await privateProfile(canvas)).not.toBeChecked()
    await expect(
      canvas.getByRole('checkbox', { name: 'Marketing emails' }),
    ).not.toBeChecked()
  },
}

/** Private profile and marketing emails both on. */
export const PrivateWithMarketing: Story = {
  decorators: [
    withSession({
      me: storyMe({
        settings: { isProfilePrivate: true, marketingEmails: true },
      }),
      seed,
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await privateProfile(canvas)).toBeChecked()
    await expect(
      canvas.getByRole('checkbox', { name: 'Marketing emails' }),
    ).toBeChecked()
  },
}

/** A switch was flipped and the API has not answered: that switch is disabled. */
export const Saving: Story = {
  decorators: [withSession({ me: storyMe(), seed })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await privateProfile(canvas))
    await waitFor(async () =>
      expect(await privateProfile(canvas)).toBeDisabled(),
    )
  },
}

/** The API rejects the change: the switch snaps back and an error shows. */
export const SaveFailed: Story = {
  decorators: [
    withSession({
      me: storyMe(),
      seed,
      responses: {
        UpdateMySettings: { kind: 'graphqlError', code: 'RATE_LIMITED' },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(await privateProfile(canvas))
    await expect(
      await canvas.findByText(/Too many attempts right now/),
    ).toBeVisible()
    await expect(await privateProfile(canvas)).not.toBeChecked()
  },
}

/** Server push is not configured: the notifications row explains it. */
export const PushNotConfigured: Story = {
  decorators: [withSession({ me: storyMe(), seed: seedVapidKey(null) })],
}
