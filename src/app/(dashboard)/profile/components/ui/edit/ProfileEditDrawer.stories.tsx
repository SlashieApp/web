import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

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

/** Phone: Replace photo opens the camera-or-library sheet over the drawer, Take photo the camera over both; closing it keeps the drawer. */
export const PhotoSourceOnPhone: Story = {
  args: { section: 'photo' },
  parameters: { touchScreen: true },
  globals: { viewport: { value: 'mobile1' } },
  decorators: [
    withSession({
      me: storyMe({ profile: { avatarUrl: storyAvatarUrl('SC') } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const body = drawer(canvasElement)
    const editor = await body.findByRole('dialog', {
      name: 'Edit profile photo',
    })
    const replace = within(editor).getByRole('button', {
      name: 'Replace photo',
    })
    await userEvent.click(replace)
    const sheet = await body.findByRole('dialog', { name: 'Add a photo' })
    await userEvent.click(
      within(sheet).getByRole('button', { name: 'Take photo' }),
    )
    const camera = await body.findByRole('dialog', { name: 'Take a photo' })
    await userEvent.click(
      within(camera).getByRole('button', { name: 'Close camera' }),
    )
    await waitFor(() => expect(camera).not.toBeInTheDocument())
    await waitFor(() => expect(sheet).not.toBeInTheDocument())
    await expect(editor).toBeInTheDocument()
    await waitFor(() => expect(replace).toHaveFocus())
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
