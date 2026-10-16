import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyAvatarUrl,
  storyMe,
  storyWorker,
  storyWorkerDraft,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'

import { WorkerProfileCard } from './WorkerProfileCard'

/** Photo and portfolio added, so nothing is left to do. */
const complete = storyWorkerMe({
  profile: { avatarUrl: storyAvatarUrl('SC') },
  worker: storyWorker({ portfolioUrls: [storyAvatarUrl('P1', '#b4533c')] }),
})

const meta = {
  title: 'Dashboard/Profile/WorkerProfileCard',
  component: WorkerProfileCard,
  parameters: { layout: 'padded' },
  args: {
    me: storyWorkerMe(),
    variant: 'live',
    onEdit: fn(),
    onEditPhoto: fn(),
  },
  decorators: [withSession({ me: storyWorkerMe() })],
} satisfies Meta<typeof WorkerProfileCard>

export default meta
type Story = StoryObj<typeof meta>

/** Customer: an invitation to become a worker. */
export const Empty: Story = {
  args: { me: storyMe(), variant: 'empty' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', {
        name: 'Become a worker',
      }),
    ).toBeVisible()
  },
}

/** Setup unfinished: the saved draft, not published, no Edit. */
export const Draft: Story = {
  args: { me: storyWorkerMe({ worker: storyWorkerDraft() }), variant: 'draft' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Not published yet')).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Edit' })).toBeNull()
  },
}

/** Live with to-dos: each to-do opens its editor (the photo one opens the photo). */
export const LiveWithTodos: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Published')).toBeVisible()
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add a profile photo' }),
    )
    await expect(args.onEditPhoto).toHaveBeenCalled()
    await userEvent.click(
      canvas.getByRole('button', { name: 'Add portfolio examples (optional)' }),
    )
    await expect(args.onEdit).toHaveBeenCalled()
  },
}

/** Live and complete: no to-do list. */
export const LiveComplete: Story = {
  args: { me: complete },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Published')).toBeVisible()
    await expect(canvas.queryByText('To do')).toBeNull()
  },
}

/** A 50 to 79 character bio still shows the 80+ to-do (the form's rule). */
export const ShortBio: Story = {
  args: {
    me: storyWorkerMe({
      worker: storyWorker({
        bio: 'Reliable handyman for shelves, mounting and flat-pack jobs.',
      }),
    }),
  },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Write a bio of 80+ characters',
      }),
    ).toBeVisible()
  },
}

/** Suspended: no Edit, and to-dos are plain text. */
export const ReadOnly: Story = {
  args: { readOnly: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Add a profile photo')).toBeVisible()
    await expect(canvas.queryAllByRole('button')).toHaveLength(0)
  },
}
