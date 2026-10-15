import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyAvatarUrl,
  storyMe,
  storyWorkerDraft,
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

/** Personal information: display name and date of birth. */
export const Personal: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(
      await drawer(canvasElement).findByRole('dialog', {
        name: 'Edit personal information',
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

/** Contact and verification: email and phone rows. */
export const Contact: Story = {
  args: { section: 'contact' },
  decorators: [
    withSession({
      me: storyMe({ profile: { contactNumber: '+447700900123' } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await drawer(canvasElement).findByRole('dialog', {
        name: 'Contact & verification',
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

/** Worker profile while setup is unfinished: a summary and Continue setup. */
export const WorkerSetupInProgress: Story = {
  args: { section: 'worker' },
  decorators: [
    withSession({
      me: storyMe({
        profile: { contactNumber: '+447700900123' },
        worker: storyWorkerDraft(),
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await drawer(canvasElement).findByText('Worker profile (in progress)'),
    ).toBeInTheDocument()
  },
}

/** Worker section opened by a customer: the Become a worker card. */
export const WorkerSectionForCustomer: Story = {
  args: { section: 'worker' },
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(
      await drawer(canvasElement).findByRole('link', {
        name: 'Start worker setup',
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
        name: 'Edit personal information',
      }),
    ).toBeInTheDocument()
  },
}
