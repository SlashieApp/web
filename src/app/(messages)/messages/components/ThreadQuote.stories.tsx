import { QuoteStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyAvatarUrl,
  storyMe,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'
import {
  STORY_OWNER_ID,
  STORY_WORKER_ID,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'

import { ThreadQuote } from './ThreadQuote'
import { jordanQuote } from './messagesStoryFixtures'

/** The task owner, who can accept or decline. */
const asOwner = withSession({ me: storyMe({ id: STORY_OWNER_ID }) })
/** The quoting worker, who can only watch the status. */
const asWorker = withSession({ me: storyWorkerMe({ id: STORY_WORKER_ID }) })

const meta = {
  title: 'Messages/ThreadQuote',
  component: ThreadQuote,
  parameters: { layout: 'padded' },
  args: { quote: jordanQuote(), locale: 'en-GB' },
} satisfies Meta<typeof ThreadQuote>

export default meta
type Story = StoryObj<typeof meta>

const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** Owner on a pending quote: Accept and Decline sit under the details. */
export const OwnerPending: Story = {
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Accept' }),
    ).toBeEnabled()
    await expect(canvas.getByRole('button', { name: 'Decline' })).toBeEnabled()
    await expect(canvas.queryByText('Awaiting reply')).toBeNull()
  },
}

/** Accept pressed: the owner picks one of the proposed times before confirming. */
export const OwnerPicksATime: Story = {
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', { name: 'Accept' }),
    )
    const dialog = await page(canvasElement).findByRole('dialog')
    const times = within(dialog).getByRole('radiogroup', {
      name: 'Pick a time',
    })
    await expect(within(times).getAllByRole('button')).toHaveLength(2)
    await expect(
      within(dialog).getByRole('button', { name: 'Accept quote' }),
    ).toBeDisabled()
  },
}

/** Decline pressed and the API has not answered: Decline is busy, Accept is disabled. */
export const OwnerDeclining: Story = {
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Decline' }),
    )
    await waitFor(() =>
      expect(
        canvasElement.querySelector('button[data-loading]'),
      ).toBeDisabled(),
    )
    await expect(canvas.getByRole('button', { name: 'Accept' })).toBeDisabled()
  },
}

/** The worker's own pending quote: a status badge instead of actions. */
export const WorkerPending: Story = {
  decorators: [asWorker],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Awaiting reply')).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

/** Accepted: the quote is now the booking. */
export const Accepted: Story = {
  args: { quote: jordanQuote({ status: QuoteStatus.Accepted }) },
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Accepted'),
    ).toBeVisible()
  },
}

/** Declined by the owner. */
export const Declined: Story = {
  args: { quote: jordanQuote({ status: QuoteStatus.Declined }) },
  decorators: [asWorker],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Declined'),
    ).toBeVisible()
  },
}

/** The owner picked another worker. */
export const NotSelected: Story = {
  args: { quote: jordanQuote({ status: QuoteStatus.NotSelected }) },
  decorators: [asWorker],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Not selected'),
    ).toBeVisible()
  },
}

/** The worker withdrew it. */
export const Withdrawn: Story = {
  args: { quote: jordanQuote({ status: QuoteStatus.Withdrawn }) },
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Withdrawn'),
    ).toBeVisible()
  },
}

/** Replaced by a newer quote from the same worker. */
export const Replaced: Story = {
  args: { quote: jordanQuote({ status: QuoteStatus.Expired }) },
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText('Replaced by a newer quote'),
    ).toBeVisible()
  },
}

/** A worker photo beside the name. */
export const WithAvatar: Story = {
  args: {
    quote: jordanQuote({
      worker: {
        id: STORY_WORKER_ID,
        profile: {
          name: 'Jordan Lee',
          avatarUrl: storyAvatarUrl('JL', '#3b6fd4'),
        },
      },
    }),
  },
  decorators: [asOwner],
}

/** A worker with no display name falls back to "Worker". */
export const UnnamedWorker: Story = {
  args: {
    quote: jordanQuote({
      worker: { id: STORY_WORKER_ID, profile: { name: null, avatarUrl: null } },
    }),
  },
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText('Worker')).toBeVisible()
  },
}

/** No message and no price: only the worker and the times. */
export const BareQuote: Story = {
  args: { quote: jordanQuote({ message: null, price: null }) },
  decorators: [asOwner],
}

/** No proposed times: the times line is left out. */
export const NoTimes: Story = {
  args: { quote: jordanQuote({ proposedSlots: [] }) },
  decorators: [asOwner],
}

/** A long message clamps to three lines. */
export const LongMessage: Story = {
  args: {
    quote: jordanQuote({
      message:
        'I can do this on Saturday morning and I will bring my own drill, spirit level, stud finder and dust sheets. The fixings are included in the price. I have mounted dozens of shelving units on plasterboard and brick, so I know which anchors to use. I will tidy up and take the packaging away afterwards.',
    }),
  },
  decorators: [asOwner],
}
