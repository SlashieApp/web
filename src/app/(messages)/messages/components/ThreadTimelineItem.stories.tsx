import { Stack } from '@chakra-ui/react'
import { FlashKind, QuoteStatus } from '@codegen/schema'
import type { ThreadItemFieldsFragment } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ReactNode } from 'react'
import { expect, waitFor, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyAvatarUrl, storyMe } from '@/app/(auth)/helpers/authStoryFixtures'
import { TaskDetailProvider } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { STORY_TASK_ID } from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import { formatTimeSlotLabel } from '@/utils/timeSlots'

import { clockTime } from '../helpers/messagesFormat'
import { ThreadTimelineItem } from './ThreadTimelineItem'
import { messagesStory } from './messagesStoryDecorator'
import {
  bookedTask,
  myMessage,
  quoteFlash,
  reviewFlash,
  storyFlashQuote,
  theirMessage,
} from './messagesStoryFixtures'

/** The task owner, who can act on a pending quote. */
const asOwner = withSession({ me: storyMe({ id: 'u-owner' }) })
/** The quoting worker from the fixtures: no actions, only the status. */
const asWorker = withSession({ me: storyMe({ id: 'u-worker' }) })

const meta = {
  title: 'Messages/ThreadTimelineItem',
  component: ThreadTimelineItem,
  args: { item: quoteFlash, locale: 'en-GB' },
} satisfies Meta<typeof ThreadTimelineItem>

export default meta
type Story = StoryObj<typeof meta>

/** Any other event on the task, as the API sends it. */
const event = (
  id: string,
  flashKind: FlashKind,
  title: string,
  body: string,
  quote: ThreadItemFieldsFragment['quote'] = null,
): ThreadItemFieldsFragment => ({
  ...quoteFlash,
  id,
  flashKind,
  title,
  body,
  quoteId: quote?.id ?? null,
  quote,
})

const ACCEPTED_BODY =
  'The quote on "Assemble a wardrobe" was accepted. You can now message each other here.'

/** The one time the worker offered, so the line can name it without a booking. */
const onlySlot = {
  id: 's-only',
  start: '2030-10-22T11:00:00.000Z',
  end: '2030-10-22T12:00:00.000Z',
}

const accepted = event(
  'line-accepted',
  FlashKind.QuoteAccepted,
  'Quote accepted',
  ACCEPTED_BODY,
  storyFlashQuote({
    status: QuoteStatus.Accepted,
    proposedSlots: [onlySlot],
  }),
)

/** A quote that offered two times: only the booking says which one was taken. */
const twoSlotQuote = storyFlashQuote({ status: QuoteStatus.Accepted })
const [, secondSlot] = twoSlotQuote.proposedSlots
const acceptedTwoSlots = event(
  'line-accepted-two-slots',
  FlashKind.QuoteAccepted,
  'Quote accepted',
  ACCEPTED_BODY,
  twoSlotQuote,
)

/** Quote accepted lines read the viewer's booking from the thread's task detail. */
const inTaskThread = (children: ReactNode) => (
  <TaskDetailProvider taskId={STORY_TASK_ID} captureView={false}>
    {children}
  </TaskDetailProvider>
)

/** The Quote accepted line's text: title, price, booked slot, time. */
const acceptedText = (canvasElement: HTMLElement) =>
  canvasElement.querySelector('[data-flash-line="QUOTE_ACCEPTED"] > p')

/** An info line: no card and nothing to press. */
const line = async (canvasElement: HTMLElement, kind: FlashKind) => {
  await expect(
    canvasElement.querySelector(`[data-flash-line="${kind}"]`),
  ).toBeVisible()
  await expect(canvasElement.querySelector('[data-flash-card]')).toBeNull()
  await expect(within(canvasElement).queryAllByRole('button')).toHaveLength(0)
}

/** A thread's timeline: the quote card, an event line, bubbles left (them) and right (me), and a review prompt. */
export const Timeline: Story = {
  decorators: messagesStory({ viewer: 'owner' }),
  render: (args) =>
    inTaskThread(
      <Stack gap={3} maxW="640px">
        {[quoteFlash, accepted, theirMessage, myMessage, reviewFlash].map(
          (item) => (
            <ThreadTimelineItem
              key={item.id}
              item={item}
              locale={args.locale}
            />
          ),
        )}
      </Stack>,
    ),
}

/** The worker's "quote sent" flash, seen by the poster: the full quote card with Accept, the only answer. */
export const QuoteSentPoster: Story = {
  decorators: [asOwner],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Accept' }),
    ).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Decline' })).toBeNull()
    await expect(
      canvasElement.querySelector('[data-flash-card="QUOTE_RECEIVED"]'),
    ).toBeVisible()
  },
}

/** The same card, seen by the worker who sent it: Awaiting reply, no actions. */
export const QuoteSentWorker: Story = {
  decorators: [asWorker],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('New quote: £80')).toBeVisible()
    await expect(canvas.getByText('Awaiting reply')).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

/** Quote accepted: one line with the quote's price and the booked slot (the quote's only time), then the time of the message; no card. */
export const QuoteAcceptedLine: Story = {
  args: { item: accepted },
  decorators: messagesStory({ viewer: 'owner' }),
  render: (args) => inTaskThread(<ThreadTimelineItem {...args} />),
  play: async ({ canvasElement, args }) => {
    await line(canvasElement, FlashKind.QuoteAccepted)
    await expect(acceptedText(canvasElement)).toHaveTextContent(
      `Quote accepted · £80 · ${formatTimeSlotLabel(onlySlot, args.locale)} · ${clockTime(accepted.createdAt, args.locale)}`,
    )
  },
}

/** Quote accepted when the quote offered two times: the slot the booking starts at, from task detail's order. */
export const QuoteAcceptedLineBookedSlot: Story = {
  args: { item: acceptedTwoSlots },
  decorators: messagesStory({
    viewer: 'owner',
    task: bookedTask({
      quoteId: twoSlotQuote.id,
      bookedStart: secondSlot.start,
      bookedEnd: secondSlot.end,
    }),
  }),
  render: (args) => inTaskThread(<ThreadTimelineItem {...args} />),
  play: async ({ canvasElement, args }) => {
    await waitFor(() =>
      expect(acceptedText(canvasElement)).toHaveTextContent(
        `Quote accepted · £80 · ${formatTimeSlotLabel(secondSlot, args.locale)} · ${clockTime(acceptedTwoSlots.createdAt, args.locale)}`,
      ),
    )
  },
}

/** Quote accepted when the quote offered two times and the booking is not known to match: no slot, rather than a wrong one. */
export const QuoteAcceptedLineNoSlot: Story = {
  args: { item: acceptedTwoSlots },
  decorators: messagesStory({ viewer: 'owner' }),
  render: (args) => inTaskThread(<ThreadTimelineItem {...args} />),
  play: async ({ canvasElement }) => {
    await line(canvasElement, FlashKind.QuoteAccepted)
    await expect(acceptedText(canvasElement)).toHaveTextContent(
      /^Quote accepted · £80 · \d{2}:\d{2}$/,
    )
  },
}

/** zh-HK: the booked slot is formatted for the viewer's locale. */
export const QuoteAcceptedLineZhHk: Story = {
  args: { item: accepted, locale: 'zh-HK' },
  decorators: messagesStory({ viewer: 'owner' }),
  render: (args) => inTaskThread(<ThreadTimelineItem {...args} />),
  play: async ({ canvasElement }) => {
    await line(canvasElement, FlashKind.QuoteAccepted)
    await expect(acceptedText(canvasElement)).toHaveTextContent(
      formatTimeSlotLabel(onlySlot, 'zh-HK'),
    )
  },
}

/**
 * A reschedule request: a line; the answer is in the bottom pin. The API
 * attaches the booked quote, but the line leaves its price out.
 */
export const RescheduleRequestedLine: Story = {
  args: {
    item: event(
      'line-reschedule',
      FlashKind.RescheduleRequested,
      'New time proposed',
      'The worker proposed a new time for "Assemble a wardrobe".',
      storyFlashQuote({ status: QuoteStatus.Accepted }),
    ),
  },
  play: async ({ canvasElement }) => {
    await line(canvasElement, FlashKind.RescheduleRequested)
    await expect(within(canvasElement).queryByText(/£/)).toBeNull()
  },
}

/**
 * The owner cancelled the task (BE-108): the worker's line, with the API's
 * title and body. It carries their still-pending quote but is no quote card,
 * and leaves the price out.
 */
export const TaskCancelledLine: Story = {
  args: {
    item: event(
      'line-task-cancelled',
      FlashKind.TaskCancelled,
      'Task cancelled',
      'The customer cancelled "Assemble a wardrobe". If they reopen it, your quote comes back.',
      storyFlashQuote({ status: QuoteStatus.Pending }),
    ),
  },
  decorators: [asWorker],
  play: async ({ canvasElement }) => {
    await line(canvasElement, FlashKind.TaskCancelled)
    await expect(
      within(canvasElement).getByText('Task cancelled'),
    ).toBeVisible()
    await expect(within(canvasElement).queryByText(/£/)).toBeNull()
  },
}

/** The owner reopened the task (BE-108): the worker's line; their quote is live again. */
export const TaskReopenedLine: Story = {
  args: {
    item: event(
      'line-task-reopened',
      FlashKind.TaskReopened,
      'Task reopened',
      'The customer reopened "Assemble a wardrobe". Your quote is live again.',
      storyFlashQuote({ status: QuoteStatus.Pending }),
    ),
  },
  decorators: [asWorker],
  play: async ({ canvasElement }) => {
    await line(canvasElement, FlashKind.TaskReopened)
    await expect(within(canvasElement).getByText('Task reopened')).toBeVisible()
  },
}

/** Marked as done by the other side: a line; confirming is in the bottom pin. */
export const MarkedDoneLine: Story = {
  args: {
    item: event(
      'line-done',
      FlashKind.OrderMarkedDone,
      'Marked as done',
      'The worker marked "Assemble a wardrobe" as done. It completes automatically in 7 days unless marked failed.',
    ),
  },
  play: async ({ canvasElement }) =>
    line(canvasElement, FlashKind.OrderMarkedDone),
}

/** A review prompt: a line that keeps its Leave a review link. */
export const ReviewPrompt: Story = {
  args: { item: reviewFlash },
  play: async ({ canvasElement }) => {
    await line(canvasElement, FlashKind.ReviewPrompt)
    await expect(
      within(canvasElement).getByRole('link', { name: 'Leave a review' }),
    ).toHaveAttribute('href', '/tasks/task-1/review?orderId=o1')
  },
}

/** A line with only a title. */
export const TitleOnlyLine: Story = {
  args: {
    item: event('line-title', FlashKind.OrderCompleted, 'Job completed', ''),
  },
}

/** A Slashie announcement stays a card, with its picture above the title. */
export const Announcement: Story = {
  args: {
    item: {
      ...quoteFlash,
      id: 'flash-image',
      flashKind: FlashKind.SystemAnnouncement,
      quote: null,
      quoteId: null,
      taskId: null,
      title: 'New: message workers in the app',
      body: 'Once you accept a quote you can chat with the worker right here.',
      imageUrl: storyAvatarUrl('NEW', '#3b6fd4'),
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      canvasElement.querySelector('[data-flash-card="SYSTEM_ANNOUNCEMENT"]'),
    ).toBeVisible()
  },
}

/** A message from the other person: left, grey bubble. */
export const Message: Story = {
  args: { item: theirMessage },
}

/** My own message: right, green bubble. */
export const MyMessage: Story = {
  args: { item: myMessage },
}

/** A long, multi-line message wraps and keeps its line breaks. */
export const LongMessage: Story = {
  args: {
    item: {
      ...theirMessage,
      body: 'Quick note before Saturday.\nI will park the van outside number 12 and need about two hours.\nA very long unbroken link that must not stretch the bubble: https://example.com/guides/mounting-a-bookshelf-on-a-plasterboard-wall-with-the-right-fixings',
    },
  },
}
