import { QuoteStatus } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyAvatarUrl,
  storyMe,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'
import {
  STORY_CLOSED_STATUS,
  STORY_OWNER_ID,
  STORY_WORKER_ID,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'

import { ThreadQuote } from './ThreadQuote'
import { jordanQuote } from './messagesStoryFixtures'

/** The task owner, who can accept. */
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

/**
 * Owner on a pending quote from a suspended worker (BE-108): "Account
 * suspended", Accept off, as on task detail.
 */
export const OwnerWorkerSuspended: Story = {
  args: { quote: jordanQuote({ workerSuspended: true }) },
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Account suspended')
    await expect(canvas.getByRole('button', { name: 'Accept' })).toBeDisabled()
  },
}

/** Owner of a suspended task (BE-108): the quote's status, no Accept. */
export const OwnerTaskSuspended: Story = {
  args: { taskSuspended: true },
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Awaiting reply')
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

/**
 * Owner of a task someone else was booked on (BE-113): this quote stays
 * PENDING, but only an open task can accept one, so no Accept.
 */
export const OwnerTaskBooked: Story = {
  args: { taskOpen: false },
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Awaiting reply')
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

/** Owner on a pending quote: Accept sits under the details, and it is the only answer. */
export const OwnerPending: Story = {
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Accept' }),
    ).toBeEnabled()
    await expect(canvas.queryByRole('button', { name: 'Decline' })).toBeNull()
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

/** Over without being accepted (the booking ended early and the task reopened): a neutral "Closed". */
export const Closed: Story = {
  args: { quote: jordanQuote({ status: STORY_CLOSED_STATUS }) },
  decorators: [asWorker],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Closed')).toBeVisible()
    await expect(canvas.queryByText('CLOSED')).toBeNull()
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
