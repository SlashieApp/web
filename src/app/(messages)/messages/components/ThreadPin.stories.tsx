import {
  OrderRequestKind,
  OrderStatus,
  QuoteStatus,
  TaskBookingStatus,
  TaskStatus,
  ThreadAttentionKind,
} from '@codegen/schema'
import type { ThreadFieldsFragment } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, waitFor, within } from 'storybook/test'

import { TaskDetailProvider } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import {
  STORY_TASK_ID,
  STORY_WORKER_ID,
  storyTaskDetail,
  storyTaskQuote,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import type { TaskDetailRecord } from '@/app/(task)/tasks/[slug]/helpers/taskDetailUtils'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import { ThreadPin } from './ThreadPin'
import { ThreadSheetContext } from './ThreadSheetContext'
import { messagesStory } from './messagesStoryDecorator'
import {
  FUTURE_END,
  FUTURE_START,
  type MessagesViewer,
  bookedTask,
  manyLiveQuotes,
  markedDone,
  needs,
  requestedOrder,
  storyQuotes,
} from './messagesStoryFixtures'

/**
 * The top pin, one story per situation (see `views/README.md`), inside the
 * task's detail context as the thread mounts it. Alex owns the task; Jordan
 * is the worker. Information only: no story here has a button.
 */
const meta = {
  title: 'Messages/ThreadPin',
  component: ThreadPin,
  parameters: { layout: 'fullscreen' },
  args: { attention: null },
  render: (args) => (
    <TaskDetailProvider taskId={STORY_TASK_ID} captureView={false}>
      {/* The thread's sheet, which the booking card opens (FE-543). */}
      <ThreadSheetContext.Provider
        value={{
          open: fn(),
          close: fn(),
          requestPending: false,
          invitationPending: false,
        }}
      >
        <ThreadPin {...args} />
      </ThreadSheetContext.Provider>
    </TaskDetailProvider>
  ),
} satisfies Meta<typeof ThreadPin>

export default meta
type Story = StoryObj<typeof meta>

/** A pin story; `attention` is what the API says waits on the viewer. */
function pin(
  viewer: MessagesViewer,
  task: TaskDetailRecord | undefined,
  attention: ThreadFieldsFragment['attention'] = null,
): Story {
  return { args: { attention }, decorators: messagesStory({ viewer, task }) }
}

/** Waits for the task to load and the pin to show the given view. */
const shows = (canvasElement: HTMLElement, view: string) =>
  waitFor(() =>
    expect(
      canvasElement.querySelector(`[data-thread-pin="${view}"]`),
    ).toBeVisible(),
  )

/** Information only: nothing to press. */
const noButtons = (canvasElement: HTMLElement) =>
  expect(within(canvasElement).queryAllByRole('button')).toHaveLength(0)

/** pin.quotes: the poster's two live quotes, cheapest first, with their status. */
export const PosterQuotes: Story = {
  ...pin(
    'owner',
    storyTaskDetail(),
    needs(ThreadAttentionKind.CompareQuotes, 2),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shows(canvasElement, 'pin.quotes')
    await expect(canvas.getByText('Live quotes · cheapest £85')).toBeVisible()
    const rows = canvas.getAllByRole('listitem')
    await expect(rows).toHaveLength(2)
    await expect(rows[0]).toHaveTextContent(/Jordan Lee.*£85.*Awaiting reply/)
    await expect(rows[1]).toHaveTextContent(/Sam Taylor.*£95.*Awaiting reply/)
    await noButtons(canvasElement)
  },
}

/** pin.quotes: five live quotes: the three cheapest, then "+2 more". */
export const PosterManyQuotes: Story = {
  ...pin(
    'owner',
    storyTaskDetail({ quotes: manyLiveQuotes(5) }),
    needs(ThreadAttentionKind.CompareQuotes, 5),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shows(canvasElement, 'pin.quotes')
    await expect(canvas.getByText('Live quotes · cheapest £80')).toBeVisible()
    await expect(canvas.getAllByText('Awaiting reply')).toHaveLength(3)
    await expect(canvas.getByText('+2 more')).toBeVisible()
  },
}

/**
 * The poster's open task with no live quotes: no pin (Ryan 23 Nov, FE-608).
 * There is no time and no live status to show, so the conversation starts
 * right under the header.
 */
export const PosterNoQuotes: Story = {
  ...pin('owner', storyTaskDetail({ quotes: [] })),
  play: async ({ canvasElement }) => {
    // The task has loaded: the placeholder is gone and nothing took its place.
    await waitFor(() =>
      expect(
        canvasElement.querySelector('[data-thread-pin-loading]'),
      ).toBeNull(),
    )
    await expect(canvasElement.querySelector('[data-thread-pin]')).toBeNull()
    await expect(
      within(canvasElement).queryByText('Your task is live - reaching workers'),
    ).toBeNull()
  },
}

/** pin.myQuote: Jordan's own pending quote: price, status and the times offered. */
export const WorkerQuote: Story = {
  ...pin('worker', storyTaskDetail()),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shows(canvasElement, 'pin.myQuote')
    await expect(canvas.getByText('Your quote')).toBeVisible()
    await expect(canvas.getByText('£85')).toBeVisible()
    await expect(canvas.getByText('Awaiting reply')).toBeVisible()
    await expect(canvas.queryByText('Sam Taylor')).toBeNull()
    await noButtons(canvasElement)
  },
}

/**
 * pin.closed: Alex booked Sam (BE-113). Jordan's quote stays pending, so the
 * pin is the task's status, "Booked by someone else", not his quote.
 */
export const WorkerBookedByOther: Story = {
  ...pin(
    'worker',
    storyTaskDetail({
      status: TaskStatus.Awarded,
      bookingStatus: TaskBookingStatus.Booked,
      quotes: [storyTaskQuote({ status: QuoteStatus.Pending })],
    }),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shows(canvasElement, 'pin.closed')
    // The status pill says Booked since FE-532 (was Awarded).
    await expect(canvas.getByText('Booked')).toBeVisible()
    await expect(canvas.getByText('Booked by someone else')).toBeVisible()
    await expect(canvas.queryByText('Your quote')).toBeNull()
    await noButtons(canvasElement)
  },
}

/** pin.closed: Sam's job was completed (BE-113). Jordan's quote stays pending: "Task completed". */
export const WorkerCompletedByOther: Story = {
  ...pin(
    'worker',
    storyTaskDetail({
      status: TaskStatus.Awarded,
      bookingStatus: TaskBookingStatus.Completed,
      quotes: [storyTaskQuote({ status: QuoteStatus.Pending })],
    }),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shows(canvasElement, 'pin.closed')
    await expect(canvas.getByText('Completed')).toBeVisible()
    await expect(canvas.getByText('Task completed')).toBeVisible()
    await noButtons(canvasElement)
  },
}

/**
 * pin.closed: the booking was cancelled and the owner hasn't reopened the
 * task (BE-116). Jordan's quote stays pending: "Booking cancelled", not his quote.
 */
export const WorkerOtherBookingEnded: Story = {
  ...pin(
    'worker',
    storyTaskDetail({
      status: TaskStatus.Awarded,
      bookingStatus: TaskBookingStatus.None,
      quotes: [storyTaskQuote({ status: QuoteStatus.Pending })],
    }),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shows(canvasElement, 'pin.closed')
    await expect(canvas.getAllByText('Cancelled').length).toBeGreaterThan(0)
    await expect(canvas.getByText('Booking cancelled')).toBeVisible()
    await expect(canvas.queryByText('Your quote')).toBeNull()
    await noButtons(canvasElement)
  },
}

/** pin.status: Jordan's quote closed with its booking and the task is open again (BE-113). */
export const WorkerQuoteClosed: Story = {
  ...pin(
    'worker',
    storyTaskDetail({
      quotes: [storyTaskQuote({ status: QuoteStatus.Closed })],
    }),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shows(canvasElement, 'pin.status')
    await expect(canvas.getByText('Open')).toBeVisible()
    await expect(canvas.getByText('Quote closed')).toBeVisible()
    await noButtons(canvasElement)
  },
}

/**
 * pin.booking: booked: one flat band (FE-567): the Booked pill and when the
 * job is, nothing the header or the thread already shows (who, the price),
 * and no card inside it. The whole band opens the booking's sheet.
 */
export const Booking: Story = {
  ...pin(
    'owner',
    bookedTask({ bookedStart: FUTURE_START, bookedEnd: FUTURE_END }),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shows(canvasElement, 'pin.booking')
    const band = canvas.getByRole('button', {
      name: 'Your booking with Jordan Lee. Open it for its actions.',
    })
    await expect(within(band).getByText('Booked')).toBeVisible()
    await expect(within(band).getByText(/\d{1,2}:\d{2}/)).toBeVisible()
    // No repeated detail: the header names the person; the thread has the price.
    await expect(within(band).queryByText('Jordan Lee')).toBeNull()
    await expect(within(band).queryByText('£85')).toBeNull()
    await expect(within(band).queryByText('Needs you')).toBeNull()
    // Flat: the band is the button, with no border or fill of its own.
    const cs = getComputedStyle(band)
    await expect(cs.borderTopWidth).toBe('0px')
    await expect(cs.boxShadow).toBe('none')
  },
}

/** Their own reschedule request waits on the other person: nothing needs them. */
export const BookingWaiting: Story = {
  ...pin(
    'worker',
    bookedTask(requestedOrder(OrderRequestKind.Reschedule, STORY_WORKER_ID)),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shows(canvasElement, 'pin.booking')
    const band = canvas.getByRole('button', {
      name: 'Your booking with Alex Chen. Open it for its actions.',
    })
    await expect(within(band).getByText('Booked')).toBeVisible()
    await expect(within(band).queryByText('Needs you')).toBeNull()
  },
}

/**
 * Something needs the viewer (their reschedule to answer): a "Needs you"
 * line on the card with what it is.
 */
export const BookingWhileAsked: Story = {
  ...pin(
    'owner',
    bookedTask(requestedOrder(OrderRequestKind.Reschedule, STORY_WORKER_ID)),
    needs(ThreadAttentionKind.AnswerReschedule),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shows(canvasElement, 'pin.booking')
    // What needs the viewer is a line in the band, which opens the sheet.
    const band = canvas.getByRole('button', {
      name: 'Your booking with Jordan Lee. Needs you: Jordan Lee wants to move the booking',
    })
    await expect(within(band).getByText('Booked')).toBeVisible()
    await expect(within(band).getByText('Needs you')).toBeVisible()
    await expect(
      within(band).getByText(/Jordan Lee wants to move the booking/),
    ).toBeVisible()
  },
}

/** pin.closed: the booking was cancelled: the final status only. */
export const Closed: Story = {
  ...pin(
    'owner',
    bookedTask({ status: OrderStatus.Cancelled, closedAt: FUTURE_START }),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shows(canvasElement, 'pin.closed')
    await expect(canvas.getByText('Cancelled')).toBeVisible()
    await expect(canvas.getByText('Booking cancelled')).toBeVisible()
    await expect(canvas.queryByText(/agreed/)).toBeNull()
  },
}

/** pin.closed: both marked it Done: Completed, Job complete. */
export const Completed: Story = {
  ...pin(
    'worker',
    bookedTask({
      status: OrderStatus.Completed,
      myCloseAction: markedDone,
      counterpartyCloseAction: markedDone,
      closedAt: FUTURE_START,
    }),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shows(canvasElement, 'pin.closed')
    await expect(canvas.getByText('Completed')).toBeVisible()
    await expect(canvas.getByText('Job complete')).toBeVisible()
    await noButtons(canvasElement)
  },
}

/**
 * A worker asked to quote who has not quoted: no pin either (Ryan 23 Nov,
 * FE-608). The "Asked to quote" item in the conversation carries the task's
 * card and the way to answer (`ThreadTimelineItem` stories).
 */
export const WorkerInvited: Story = {
  ...pin(
    'worker',
    storyTaskDetail({
      quotes: [],
      viewerQuoteInvitation: {
        customerName: 'Alex Chen',
        createdAt: '2026-06-01T10:00:00.000Z',
        dismissed: false,
      },
    }),
    needs(ThreadAttentionKind.QuoteInvitation),
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(
        canvasElement.querySelector('[data-thread-pin-loading]'),
      ).toBeNull(),
    )
    await expect(canvasElement.querySelector('[data-thread-pin]')).toBeNull()
    await expect(
      within(canvasElement).queryByRole('button', { name: /Needs you/ }),
    ).toBeNull()
  },
}

/** The task is still loading: a placeholder row, no pin yet. */
export const Loading: Story = {
  ...pin('owner', undefined),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-thread-pin]')).toBeNull()
  },
}

/** zh-HK: the poster's live quotes in Traditional Chinese. */
export const ZhHk: Story = {
  ...PosterQuotes,
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/messages' } } },
  decorators: [
    ...messagesStory({ viewer: 'owner', task: storyTaskDetail() }),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shows(canvasElement, 'pin.quotes')
    await expect(canvas.getByText('有效報價 · 最低 £85')).toBeVisible()
    await expect(canvas.getAllByText('等待回覆')).toHaveLength(2)
  },
}

/** Phones: the quotes stay compact, one row each. */
export const Phone: Story = {
  ...PosterQuotes,
  globals: { viewport: { value: 'mobile1' } },
}

/** pin.quotes: Sam's quote is closed, so it isn't live: only Jordan's shows. */
export const PosterOneQuoteClosed: Story = {
  ...pin(
    'owner',
    storyTaskDetail({
      quotes: storyQuotes(QuoteStatus.Pending, QuoteStatus.Closed),
    }),
    needs(ThreadAttentionKind.CompareQuotes, 1),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await shows(canvasElement, 'pin.quotes')
    await expect(canvas.getByText('Live quotes')).toBeVisible()
    await expect(canvas.getAllByRole('listitem')).toHaveLength(1)
    await expect(canvas.queryByText('Sam Taylor')).toBeNull()
  },
}
