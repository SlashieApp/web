import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyAvatarUrl,
  storyMe,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'

import { ProfileEditDrawer } from './ProfileEditDrawer'

const meta = {
  title: 'Dashboard/Profile/ProfileEditDrawer',
  component: ProfileEditDrawer,
  parameters: { layout: 'padded' },
  args: { section: 'personal', onOpenChange: fn() },
} satisfies Meta<typeof ProfileEditDrawer>

export default meta
type Story = StoryObj<typeof meta>

const drawer = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** Edit details: display name and private date of birth. */
export const Personal: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(
      await drawer(canvasElement).findByRole('dialog', {
        name: 'Edit details',
      }),
    ).toBeInTheDocument()
    await expect(
      drawer(canvasElement).getByLabelText('Display name'),
    ).toHaveValue('Sam Carter')
  },
}

/** Profile photo: the upload card. */
export const Photo: Story = {
  args: { section: 'photo' },
  decorators: [
    withSession({
      me: storyMe({ profile: { avatarUrl: storyAvatarUrl('SC') } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await drawer(canvasElement).findByRole('dialog', {
        name: 'Edit profile photo',
      }),
    ).toBeInTheDocument()
  },
}

/** Worker profile of a published worker: the full editor. */
export const Worker: Story = {
  args: { section: 'worker' },
  decorators: [withSession({ me: storyWorkerMe() })],
  play: async ({ canvasElement }) => {
    await expect(
      await drawer(canvasElement).findByRole('dialog', {
        name: 'Edit worker profile',
      }),
    ).toBeInTheDocument()
  },
}

/** Closed: nothing is rendered. */
export const Closed: Story = {
  args: { section: null },
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(drawer(canvasElement).queryByRole('dialog')).toBeNull()
  },
}

/** Phones: the drawer takes the full width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(
      await drawer(canvasElement).findByRole('dialog', {
        name: 'Edit details',
      }),
    ).toBeInTheDocument()
  },
}
