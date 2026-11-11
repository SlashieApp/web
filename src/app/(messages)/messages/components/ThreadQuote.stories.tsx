import { QuoteStatus } from '@codegen/schema'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyAvatarUrl,
  storyMe,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'
import {
  TaskDetailContext,
  type TaskDetailContextValue,
} from '@/app/(task)/tasks/[slug]/context/TaskDetailContext'
import {
  STORY_OWNER_ID,
  STORY_WORKER_ID,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'

import { QuoteSheetBody, ThreadQuote } from './ThreadQuote'
import { ThreadSheetContext } from './ThreadSheetContext'
import { jordanQuote } from './messagesStoryFixtures'

/** The task owner, who can accept. */
const asOwner = withSession({ me: storyMe({ id: STORY_OWNER_ID }) })
/** The quoting worker, who can withdraw their own pending quote. */
const asWorker = withSession({ me: storyWorkerMe({ id: STORY_WORKER_ID }) })

type TaskState = {
  isSuspended?: boolean
  isOpen?: boolean
  /** Task detail's view: someone else's booking reads from it (BE-113, BE-116). */
  view?: string
  /** The worker's own quote, which they can withdraw. */
  myQuoteId?: string
}

/**
 * Story-only: the thread's task, as the quote reads it from task detail (a
 * suspended task, a task no longer open, someone else's booking, the
 * worker's own quote).
 */
function withTask({
  isSuspended = false,
  isOpen = true,
  view = 'owner.open.quotes',
  myQuoteId,
}: TaskState = {}): Decorator {
  const value = {
    task: { id: 'task-1' },
    view,
    myQuote: myQuoteId ? { id: myQuoteId } : null,
    permissions: {
      isSuspended,
      isOpen,
      canWithdrawQuote: Boolean(myQuoteId),
    },
    onWithdrawQuote: async () => true,
    withdrawingQuote: false,
  } as unknown as TaskDetailContextValue
  return (Story) => (
    <TaskDetailContext.Provider value={value}>
      <Story />
    </TaskDetailContext.Provider>
  )
}

const meta = {
  title: 'Messages/ThreadQuote',
  component: ThreadQuote,
  parameters: { layout: 'padded' },
  args: { quote: jordanQuote() },
} satisfies Meta<typeof ThreadQuote>

export default meta
type Story = StoryObj<typeof meta>

const page = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/**
 * The card (FE-543), in the Home "Compare quotes" language: the worker,
 * where the quote stands, the price, and the message on one line. No
 * buttons: the poster accepts in the sheet.
 */
export const OwnerPending: Story = {
  decorators: [withTask(), asOwner],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Jordan Lee')
    await expect(canvas.getByText('£85')).toBeVisible()
    await expect(canvas.getByText('Awaiting reply')).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

/** In a task thread the whole card opens the quote in the sheet. */
export const OpensTheSheet: Story = {
  decorators: [
    withTask(),
    asOwner,
    (Story, { parameters }) => (
      <ThreadSheetContext.Provider
        value={{
          open: parameters.open,
          close: fn(),
          requestPending: false,
        }}
      >
        <Story />
      </ThreadSheetContext.Provider>
    ),
  ],
  parameters: { open: fn() },
  play: async ({ canvasElement, parameters }) => {
    await userEvent.click(
      await within(canvasElement).findByRole('button', {
        name: 'Quote from Jordan Lee, £85. Open it.',
      }),
    )
    await expect(parameters.open).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'quote' }),
    )
  },
}

/**
 * The worker's own pending quote once someone else is booked (BE-113): the
 * task's status, not "Awaiting reply".
 */
export const WorkerBookedByOther: Story = {
  decorators: [withTask({ view: 'worker.bookedByOther' }), asWorker],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Booked by someone else'),
    ).toBeVisible()
    await expect(canvas.queryByText('Awaiting reply')).toBeNull()
  },
}

/** Someone else's job is complete: "Task completed". */
export const WorkerTaskCompleted: Story = {
  decorators: [withTask({ view: 'worker.completedByOther' }), asWorker],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Task completed')).toBeVisible()
    await expect(canvas.queryByText('Awaiting reply')).toBeNull()
  },
}

/** The booking ended and the task isn't reopened (BE-116): "Booking cancelled". */
export const WorkerOtherBookingEnded: Story = {
  decorators: [withTask({ view: 'worker.otherBookingEnded' }), asWorker],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Booking cancelled')).toBeVisible()
    await expect(canvas.queryByText('Awaiting reply')).toBeNull()
  },
}

/** A quote that is no longer pending keeps its own status, whatever the task says. */
export const WorkerWithdrawnKeepsItsStatus: Story = {
  args: { quote: jordanQuote({ status: QuoteStatus.Withdrawn }) },
  decorators: [withTask({ view: 'worker.otherBookingEnded' }), asWorker],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Withdrawn')).toBeVisible()
    await expect(canvas.queryByText('Booking cancelled')).toBeNull()
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
  args: { quote: jordanQuote({ status: QuoteStatus.Closed }) },
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

/** No message and no price: only the worker and where the quote stands. */
export const BareQuote: Story = {
  args: { quote: jordanQuote({ message: null, price: null }) },
  decorators: [asOwner],
}

/** A long message is one line on the card; the sheet has all of it. */
export const LongMessage: Story = {
  args: {
    quote: jordanQuote({
      message:
        'I can do this on Saturday morning and I will bring my own drill, spirit level, stud finder and dust sheets. The fixings are included in the price. I have mounted dozens of shelving units on plasterboard and brick, so I know which anchors to use. I will tidy up and take the packaging away afterwards.',
    }),
  },
  decorators: [asOwner],
}

type SheetStory = StoryObj<typeof QuoteSheetBody>

const sheet = (quote = jordanQuote()) =>
  ({
    render: () => <QuoteSheetBody quote={quote} locale="en-GB" onDone={fn()} />,
  }) satisfies Partial<SheetStory>

/**
 * The quote in the sheet, for the poster: the whole quote (the times
 * offered, the message) and Accept, the only answer there is.
 */
export const SheetOwnerPending: Story = {
  ...sheet(),
  decorators: [withTask(), asOwner],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Accept' }),
    ).toBeEnabled()
    await expect(canvas.getByText('Times offered')).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Decline' })).toBeNull()
  },
}

/** Accept pressed: the owner picks one of the proposed times before confirming. */
export const SheetOwnerPicksATime: Story = {
  ...sheet(),
  decorators: [withTask(), asOwner],
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

/**
 * A suspended worker's quote (BE-108): "Account suspended", Accept off, as
 * on task detail.
 */
export const SheetOwnerWorkerSuspended: Story = {
  ...sheet(jordanQuote({ workerSuspended: true })),
  decorators: [withTask(), asOwner],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Account suspended')
    await expect(canvas.getByRole('button', { name: 'Accept' })).toBeDisabled()
  },
}

/** A suspended task (BE-108): the quote's status, no Accept. */
export const SheetOwnerTaskSuspended: Story = {
  ...sheet(),
  decorators: [withTask({ isSuspended: true }), asOwner],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Awaiting reply')
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

/**
 * Someone else was booked (BE-113): this quote stays PENDING, but only an
 * open task can accept one, so no Accept.
 */
export const SheetOwnerTaskBooked: Story = {
  ...sheet(),
  decorators: [withTask({ isOpen: false }), asOwner],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByText('Awaiting reply')
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

/** The worker's own pending quote: Withdraw quote, and no Accept (Ryan, 11 Nov). */
export const SheetWorkerOwnPending: Story = {
  ...sheet(),
  decorators: [
    withTask({ view: 'worker.open.quoted', myQuoteId: jordanQuote().id }),
    asWorker,
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Withdraw quote' }),
    ).toBeEnabled()
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}
