import {
  Currency,
  OrderCloseKind,
  OrderRequestKind,
  OrderStatus,
  QuoteStatus,
  TaskStatus,
  ThreadAttentionKind,
} from '@codegen/schema'
import type { ThreadFieldsFragment } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { TaskDetailProvider } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import {
  STORY_OWNER_ID,
  STORY_TASK_ID,
  STORY_WORKER_ID,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import type { TaskDetailRecord } from '@/app/(task)/tasks/[slug]/helpers/taskDetailUtils'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import type { OrderItem } from '@/utils/orderHelpers'

import { ThreadPin } from './ThreadPin'
import { messagesStory } from './messagesStoryDecorator'
import { type MessagesViewer, otherPartyFor } from './messagesStoryFixtures'

/**
 * One story per pin view (see `views/README.md`), inside the task's detail
 * context as the thread header mounts it. Alex owns the task; Jordan is the
 * worker.
 */
const meta = {
  title: 'Messages/ThreadPin',
  component: ThreadPin,
  parameters: { layout: 'fullscreen' },
  args: { party: otherPartyFor('owner'), attention: null },
  render: (args) => (
    <TaskDetailProvider taskId={STORY_TASK_ID} captureView={false}>
      <ThreadPin {...args} />
    </TaskDetailProvider>
  ),
} satisfies Meta<typeof ThreadPin>

export default meta
type Story = StoryObj<typeof meta>

const FUTURE = '2030-06-10T14:00:00.000Z'
const FUTURE_END = '2030-06-10T16:00:00.000Z'
const AT = '2026-10-15T10:00:00.000Z'
// The order query reads `failedReason` on your own close action.
const done = { kind: OrderCloseKind.Done, at: AT, failedReason: null }
const failed = { kind: OrderCloseKind.Failed, at: AT, failedReason: null }

const otherWorker = {
  id: 'worker-detail-2',
  profile: { name: 'Sam Taylor', avatarUrl: null },
  worker: { id: 'worker-profile-2', isVerified: false },
}

/** Jordan's quote (when given) and Sam's. */
function quotes(mine: QuoteStatus | null, other: QuoteStatus) {
  return [
    ...(mine ? [storyTaskQuote({ status: mine })] : []),
    storyTaskQuote({
      id: 'quote-detail-2',
      workerUserId: 'worker-detail-2',
      status: other,
      price: { amount: 95, currency: Currency.Gbp },
      worker: otherWorker,
    }),
  ]
}

/** Jordan booked at £85; the order says where the booking stands. */
function booked(order: Partial<OrderItem> = {}) {
  return storyTaskDetail({
    status: TaskStatus.Awarded,
    quotes: quotes(QuoteStatus.Accepted, QuoteStatus.NotSelected),
    orders: [storyTaskOrder(order)],
  })
}

function request(kind: OrderRequestKind, by: string): Partial<OrderItem> {
  return {
    status:
      kind === OrderRequestKind.Reschedule
        ? OrderStatus.Rescheduling
        : OrderStatus.CancelRequested,
    bookedStart: FUTURE,
    bookedEnd: FUTURE_END,
    pendingRequest: {
      kind,
      requestedByUserId: by,
      requestedAt: AT,
      proposedSlots:
        kind === OrderRequestKind.Reschedule
          ? [
              {
                id: 'slot-r1',
                start: '2030-06-12T09:00:00.000Z',
                end: '2030-06-12T11:00:00.000Z',
              },
              { id: 'slot-r2', start: '2030-06-13T14:00:00.000Z', end: null },
            ]
          : [],
    },
  } as Partial<OrderItem>
}

/**
 * A pin story. `attention` is what the API says waits on the viewer
 * (`thread.attention`): it tints the card; null leaves it plain.
 */
function pin(
  viewer: MessagesViewer,
  task: TaskDetailRecord | undefined,
  party: ThreadFieldsFragment['otherParty'] = otherPartyFor(viewer),
  attention: ThreadFieldsFragment['attention'] = null,
): Story {
  return {
    args: { party, attention },
    decorators: messagesStory({ viewer, task }),
  }
}

const needs = (kind: ThreadAttentionKind, count: number | null = null) => ({
  kind,
  count,
})

/** True when the card is tinted as waiting on the viewer. */
const tinted = (canvasElement: HTMLElement) =>
  canvasElement
    .querySelector('[data-thread-pin]')
    ?.hasAttribute('data-needs-you')

/** Waits for the task to load and the card to show the given pin view. */
const card = (canvasElement: HTMLElement, view: string) =>
  waitFor(() =>
    expect(
      canvasElement.querySelector(`[data-thread-pin="${view}"]`),
    ).toBeVisible(),
  )

/** pin.quotes: the owner's quotes are waiting; nobody is booked, so no person. */
export const Quotes: Story = {
  ...pin(
    'owner',
    storyTaskDetail(),
    null,
    needs(ThreadAttentionKind.CompareQuotes, 2),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await card(canvasElement, 'pin.quotes')
    await expect(
      canvas.getByText('2 quotes - compare and accept'),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Compare quotes' }),
    ).toHaveAttribute('href', `/tasks/${STORY_TASK_ID}#task-quotes`)
  },
}

/** pin.status: the owner's open task with no quotes yet. */
export const Status: Story = {
  ...pin('owner', storyTaskDetail({ quotes: [] }), null),
  play: async ({ canvasElement }) => {
    await card(canvasElement, 'pin.status')
    await expect(
      within(canvasElement).getByText('Your task is live - reaching workers'),
    ).toBeVisible()
  },
}

/** pin.quoting: Jordan's quote is pending: Quote sent, the price, Edit quote. */
export const Quoting: Story = {
  ...pin('worker', storyTaskDetail()),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await card(canvasElement, 'pin.quoting')
    await expect(canvas.getByText('Alex Chen')).toBeVisible()
    await expect(canvas.getByText('Customer')).toBeVisible()
    await expect(canvas.getByText('£85')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Edit quote' }),
    ).toHaveAttribute('href', `/tasks/${STORY_TASK_ID}/quote`)
  },
}

/** pin.requote: Jordan's quote was declined and the task is still open. */
export const Requote: Story = {
  ...pin(
    'worker',
    storyTaskDetail({
      quotes: quotes(QuoteStatus.Declined, QuoteStatus.Pending),
    }),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await card(canvasElement, 'pin.requote')
    await expect(canvas.getByText('Quote declined')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Send quote' }),
    ).toHaveAttribute('href', `/tasks/${STORY_TASK_ID}/quote`)
  },
}

/** pin.booked: booked, nothing to do yet: the time and the agreed price. */
export const Booked: Story = {
  ...pin('owner', booked({ bookedStart: FUTURE, bookedEnd: FUTURE_END })),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await card(canvasElement, 'pin.booked')
    await expect(tinted(canvasElement)).toBe(false)
    await expect(canvas.getByText(/£85 agreed/)).toBeVisible()
    await expect(canvas.getByText(/23 jobs done/)).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: /Jordan Lee/ }),
    ).toHaveAttribute('href', `/profile/${STORY_WORKER_ID}`)
    await expect(canvas.getByText('View profile')).toBeVisible()
  },
}

/** pin.waiting: Jordan asked to move the booking and waits for Alex. */
export const Waiting: Story = {
  ...pin(
    'worker',
    booked(request(OrderRequestKind.Reschedule, STORY_WORKER_ID)),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await card(canvasElement, 'pin.waiting')
    await expect(
      canvas.getByText('2 reviews · 3 bookings completed'),
    ).toBeVisible()
    await expect(canvas.getByText('Reschedule requested')).toBeVisible()
    await expect(canvas.getByText(/Waiting for Alex Chen/)).toBeVisible()
  },
}

const answerTask = booked(request(OrderRequestKind.Reschedule, STORY_WORKER_ID))

/** pin.answer: Jordan wants to move the booking: Alex answers in the card. */
export const Answer: Story = {
  ...pin(
    'owner',
    answerTask,
    undefined,
    needs(ThreadAttentionKind.AnswerReschedule),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await card(canvasElement, 'pin.answer')
    await expect(tinted(canvasElement)).toBe(true)
    await expect(
      canvas.getByText('Jordan Lee wants to move the booking'),
    ).toBeVisible()
    await expect(
      canvas.getAllByRole('button', { name: 'Use this time' }),
    ).toHaveLength(2)
    await expect(
      canvas.getByRole('button', { name: 'Keep current time' }),
    ).toBeVisible()
  },
}

/** pin.answer: Alex asked to cancel: Jordan accepts or keeps the booking. */
export const AnswerCancel: Story = {
  ...pin(
    'worker',
    booked(request(OrderRequestKind.Cancel, STORY_OWNER_ID)),
    undefined,
    needs(ThreadAttentionKind.AnswerCancel),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await card(canvasElement, 'pin.answer')
    await expect(canvas.getByText('Alex Chen asked to cancel')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Accept cancellation' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Keep booking' }),
    ).toBeVisible()
  },
}

/** pin.close: the job time has started: when, the price, slide to mark Done. */
export const Close: Story = {
  ...pin('worker', booked(), undefined, needs(ThreadAttentionKind.MarkDone)),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await card(canvasElement, 'pin.close')
    await expect(canvas.getByText('Job time has started')).toBeVisible()
    await expect(canvas.getByText(/£85 agreed/)).toBeVisible()
    await expect(canvas.getByText('Slide to mark Done')).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Something went wrong' }),
    ).toBeVisible()
  },
}

/** pin.confirm: Jordan marked it Done: Alex marks it Done too. */
export const Confirm: Story = {
  ...pin(
    'owner',
    booked({
      counterpartyCloseAction: done,
      autoDoneAt: '2026-10-22T10:00:00.000Z',
    }),
    undefined,
    needs(ThreadAttentionKind.ConfirmDone),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await card(canvasElement, 'pin.confirm')
    await expect(canvas.getByText('Jordan Lee marked it Done')).toBeVisible()
    await expect(canvas.getByText(/completes automatically on/)).toBeVisible()
    await expect(canvas.getByText('Slide to mark Done')).toBeVisible()
  },
}

/** pin.conflict: Done on one side, Failed on the other: open the task. */
export const Conflict: Story = {
  ...pin(
    'owner',
    booked({
      status: OrderStatus.Conflict,
      myCloseAction: done,
      counterpartyCloseAction: failed,
    }),
    undefined,
    needs(ThreadAttentionKind.Conflict),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await card(canvasElement, 'pin.conflict')
    await expect(canvas.getByText('This booking needs resolving')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Open task' }),
    ).toHaveAttribute('href', `/tasks/${STORY_TASK_ID}`)
  },
}

/** pin.done: job complete: the agreed price and Review. */
export const Done: Story = {
  ...pin(
    'worker',
    booked({
      status: OrderStatus.Completed,
      myCloseAction: done,
      counterpartyCloseAction: done,
      closedAt: AT,
    }),
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await card(canvasElement, 'pin.done')
    await expect(canvas.getByText('Completed')).toBeVisible()
    await expect(canvas.getByText('£85 agreed')).toBeVisible()
    await expect(canvas.getByRole('link', { name: 'Review' })).toHaveAttribute(
      'href',
      `/tasks/${STORY_TASK_ID}/review?orderId=order-detail-1`,
    )
  },
}

/** pin.notSelected: the task went to Sam: a Not selected pill, nothing else. */
export const NotSelected: Story = {
  ...pin(
    'worker',
    storyTaskDetail({
      status: TaskStatus.Awarded,
      quotes: quotes(QuoteStatus.NotSelected, QuoteStatus.Accepted),
    }),
  ),
  play: async ({ canvasElement }) => {
    await card(canvasElement, 'pin.notSelected')
    await expect(within(canvasElement).getByText('Not selected')).toBeVisible()
  },
}

/** pin.closed: the booking was cancelled: the headline only. */
export const Closed: Story = {
  ...pin('owner', booked({ status: OrderStatus.Cancelled, closedAt: AT })),
  play: async ({ canvasElement }) => {
    await card(canvasElement, 'pin.closed')
    await expect(
      within(canvasElement).getByText('Booking cancelled'),
    ).toBeVisible()
  },
}

/** The task is still loading: a placeholder row, no card yet. */
export const Loading: Story = {
  ...pin('owner', undefined),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-thread-pin]')).toBeNull()
    await expect(within(canvasElement).queryByText('Jordan Lee')).toBeNull()
  },
}

/** The other person deleted their account: no photo and no profile link. */
export const DeletedUser: Story = {
  ...pin('owner', booked({ bookedStart: FUTURE, bookedEnd: FUTURE_END }), {
    ...otherPartyFor('owner'),
    name: 'Deleted user',
    deleted: true,
    ratingSummary: { average: null, count: 0 },
    hostedCompletedCount: 0,
    completedJobsCount: 0,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Deleted user')).toBeVisible()
    await expect(
      canvas.queryByRole('link', { name: /Deleted user/ }),
    ).toBeNull()
  },
}

/** zh-HK: the reschedule answer in Traditional Chinese. */
export const ZhHk: Story = {
  ...Answer,
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/messages' } } },
  decorators: [
    ...messagesStory({ viewer: 'owner', task: answerTask }),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Jordan Lee 想更改預約時間'),
    ).toBeVisible()
    await expect(canvas.getByText('工作者')).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: /Jordan Lee/ }),
    ).toHaveAttribute('href', `/zh-hk/profile/${STORY_WORKER_ID}`)
  },
}

/** Phones: the profile link keeps its arrow; the answer buttons stay in the card. */
export const Phone: Story = {
  ...Answer,
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await card(canvasElement, 'pin.answer')
    await expect(canvas.getByText('View profile')).not.toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Keep current time' }),
    ).toBeVisible()
  },
}
