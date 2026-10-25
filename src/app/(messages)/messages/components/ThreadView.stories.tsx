import {
  FlashKind,
  OrderPartyRole,
  OrderRequestKind,
  QuoteStatus,
  TaskBookingStatus,
  TaskStatus,
  ThreadAttentionKind,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, waitFor, within } from 'storybook/test'

import {
  STORY_WORKER_ID,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { formatTimeSlotLabel } from '@/utils/timeSlots'

import { ThreadView } from './ThreadView'

import { messagesStory } from './messagesStoryDecorator'
import {
  STORY_THREAD_ID,
  bookedConversation,
  bookedTask as bookedTaskWith,
  conversationFlash,
  conversationMessage,
  jordanQuote,
  manyMessages,
  needs,
  requestedOrder,
  storyQuotes,
  systemAnnouncements,
  systemThread,
  taskThread,
} from './messagesStoryFixtures'

/** The owner's open task, so the header menu has its actions. */
const openTask = storyTaskDetail()

const FRAME = { height: '640px', maxW: '720px', task: openTask } as const

/** Jordan booked for a future slot: the top pin shows the time and price. */
const bookedTask = storyTaskDetail({
  status: TaskStatus.Awarded,
  bookingStatus: TaskBookingStatus.Booked,
  quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
  orders: [
    storyTaskOrder({
      bookedStart: '2030-06-10T14:00:00.000Z',
      bookedEnd: '2030-06-10T16:00:00.000Z',
    }),
  ],
})

const BOOKED = { ...FRAME, task: bookedTask } as const

const meta = {
  title: 'Messages/ThreadView',
  component: ThreadView,
  parameters: { layout: 'fullscreen' },
  args: { threadId: STORY_THREAD_ID },
} satisfies Meta<typeof ThreadView>

export default meta
type Story = StoryObj<typeof meta>

const ownerItems = bookedConversation('owner')
const workerItems = bookedConversation('worker')

/** A quote still waiting for the owner. */
const pendingItems = [
  conversationFlash(
    'p-1',
    FlashKind.QuoteReceived,
    'New quote: £85',
    'Jordan can come on Saturday morning.',
    new Date().toISOString(),
    {
      quoteId: 'q-jordan',
      quote: jordanQuote({ status: QuoteStatus.Pending }),
    },
  ),
]

/**
 * thread.open: owner and worker chatting about a booked task. Day dividers,
 * the top pin under the header, and a one-line composer.
 */
export const Conversation: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    thread: taskThread('owner', {}, ownerItems),
    items: ownerItems,
    ...BOOKED,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const log = await canvas.findByRole('log')
    await expect(log).toHaveTextContent('the spare key is with the neighbour')
    await expect(within(log).getByText('Yesterday')).toBeVisible()
    await expect(within(log).getByText('Today')).toBeVisible()
    const composer = canvas.getByRole('textbox', { name: 'Message Jordan Lee' })
    await expect(composer).toBeEnabled()
    await expect(composer.getBoundingClientRect().height).toBeLessThan(56)
    await expect(canvas.getByRole('button', { name: 'Send' })).toBeDisabled()
  },
}

/** zh-HK: day dividers and the composer in Traditional Chinese. */
export const ZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/messages' } } },
  decorators: [
    ...messagesStory({
      viewer: 'owner',
      thread: taskThread('owner', {}, ownerItems),
      items: ownerItems,
      ...BOOKED,
    }),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const log = await canvas.findByRole('log')
    await expect(within(log).getByText('今日')).toBeVisible()
    await expect(within(log).getByText('昨日')).toBeVisible()
    await expect(
      canvas.getByRole('textbox', { name: '傳送訊息給 Jordan Lee' }),
    ).toHaveAttribute('placeholder', '輸入訊息')
  },
}

/** The same conversation from the worker's side: the bubbles swap sides. */
export const AsWorker: Story = {
  decorators: messagesStory({
    viewer: 'worker',
    thread: taskThread('worker', {}, workerItems),
    items: workerItems,
    ...BOOKED,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('textbox', {
        name: 'Message Alex Chen',
      }),
    ).toBeEnabled()
  },
}

/**
 * thread.locked: the poster before booking: "2 workers quoted", the live
 * quotes in the top pin, Accept on the quote card, no composer and no bottom
 * pin (the quote cards handle comparing).
 */
export const OwnerPendingQuote: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    thread: taskThread(
      'owner',
      {
        canSend: false,
        otherParty: null,
        attention: needs(ThreadAttentionKind.CompareQuotes, 2),
      },
      pendingItems,
    ),
    items: pendingItems,
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: '2 workers quoted' }),
    ).toBeVisible()
    await expect(
      await canvas.findByRole('button', { name: 'Accept' }),
    ).toBeVisible()
    await expect(
      await canvas.findByText('Live quotes · cheapest £85'),
    ).toBeVisible()
    await expect(canvasElement.querySelector('[data-bottom-pin]')).toBeNull()
    await expect(
      canvas.getByText('You can message here once a quote is accepted.'),
    ).toBeVisible()
  },
}

/** thread.locked: worker who has quoted and is waiting: their quote pinned and on the card, Awaiting reply. */
export const WorkerAwaitingReply: Story = {
  decorators: messagesStory({
    viewer: 'worker',
    thread: taskThread('worker', { canSend: false }, pendingItems),
    items: pendingItems,
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const log = await canvas.findByRole('log')
    await expect(within(log).getByText('Awaiting reply')).toBeVisible()
    await expect(await canvas.findByText('Your quote')).toBeVisible()
    await expect(canvas.queryByRole('textbox')).toBeNull()
  },
}

const askedTask = bookedTaskWith(
  requestedOrder(OrderRequestKind.Reschedule, STORY_WORKER_ID),
)
const askedItems = [
  conversationFlash(
    'a-1',
    FlashKind.RescheduleRequested,
    'New time proposed',
    'The worker proposed a new time for "Mount bookshelf on living room wall".',
    new Date().toISOString(),
  ),
  ...ownerItems,
]
const askedThread = taskThread(
  'owner',
  { attention: needs(ThreadAttentionKind.AnswerReschedule) },
  askedItems,
)

const refetchThreads = fn()

/** The booking after its start has passed (the fixture's default, in the past). */
const startedOrder = storyTaskOrder()

/**
 * The booked start passes while the thread is open: task detail's view moves
 * on (the cache says the booking is ahead, its next fetch says it has begun),
 * so the threads are fetched again, once, for `attention` to catch up. The
 * first view alone is not a change.
 */
export const BookedStartRefetchesThreads: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    thread: taskThread('owner', {}, ownerItems),
    items: ownerItems,
    ...BOOKED,
    taskNext: storyTaskDetail({
      status: TaskStatus.Awarded,
      quotes: [storyTaskQuote({ status: QuoteStatus.Accepted })],
      orders: [startedOrder],
    }),
    inbox: { refetchThreads },
  }),
  play: async ({ canvasElement }) => {
    // The top pin shows the new booking once the view has moved on.
    await waitFor(() =>
      expect(
        canvasElement.querySelector('[data-thread-pin="pin.booking"]'),
      ).toHaveTextContent(
        formatTimeSlotLabel(
          { start: startedOrder.bookedStart, end: startedOrder.bookedEnd },
          'en-GB',
        ),
      ),
    )
    await expect(refetchThreads).toHaveBeenCalledTimes(1)
  },
}

/** The bottom pin sits between the timeline and the composer; the newest item stays in view. */
async function checkBottomPinLayout(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  const pin = await canvas.findByRole('region', { name: 'Needs you' })
  await expect(
    within(pin).getByText('Jordan Lee wants to move the booking'),
  ).toBeVisible()
  await expect(
    within(pin).getByRole('button', { name: 'Keep current time' }),
  ).toBeVisible()
  const composer = canvas.getByRole('textbox', { name: 'Message Jordan Lee' })
  await expect(composer).toBeVisible()
  await expect(pin.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    composer.getBoundingClientRect().top,
  )
  const log = canvas.getByRole('log')
  const timeline = log.parentElement?.parentElement as HTMLElement
  const newest = log.lastElementChild as HTMLElement
  await waitFor(() =>
    expect(newest.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      timeline.getBoundingClientRect().bottom + 1,
    ),
  )
  await expect(timeline.getBoundingClientRect().bottom).toBeLessThanOrEqual(
    pin.getBoundingClientRect().top + 1,
  )
}

/**
 * thread.open with something waiting: Jordan asked to move the booking. The
 * timeline shows it as a line, the bottom pin holds the answer buttons above
 * the composer, and the top pin keeps the booking facts.
 */
export const NeedsYou: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    thread: askedThread,
    items: askedItems,
    ...FRAME,
    task: askedTask,
  }),
  play: async ({ canvasElement }) => checkBottomPinLayout(canvasElement),
}

/** Phones: the same ask; the pin stays above the composer and the newest message stays in view. */
export const PhoneNeedsYou: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: messagesStory({
    viewer: 'owner',
    thread: askedThread,
    items: askedItems,
    task: askedTask,
    height: '560px',
  }),
  play: async ({ canvasElement }) => checkBottomPinLayout(canvasElement),
}

/**
 * thread.bookedByOther: someone else was booked (BE-113). The worker's quote
 * stays pending and no message tells them, so the thread says so quietly: the
 * top pin says "Booked by someone else", and the composer line replaces "You
 * can message here once a quote is accepted". No new line in the log.
 */
export const WorkerBookedByOther: Story = {
  decorators: messagesStory({
    viewer: 'worker',
    thread: taskThread('worker', { canSend: false }, pendingItems),
    items: pendingItems,
    ...FRAME,
    task: storyTaskDetail({
      status: TaskStatus.Awarded,
      bookingStatus: TaskBookingStatus.Booked,
      quotes: [storyTaskQuote({ status: QuoteStatus.Pending })],
    }),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Booked by someone else'),
    ).toBeVisible()
    await expect(
      await canvas.findByText(
        "Booked by someone else. You can't message here.",
      ),
    ).toBeVisible()
    await expect(
      canvas.queryByText('You can message here once a quote is accepted.'),
    ).toBeNull()
    // Quiet: the log holds only the quote the worker sent, nothing about the booking.
    await expect(canvas.getByRole('log')).not.toHaveTextContent('someone else')
    await expect(canvas.queryByRole('textbox')).toBeNull()
  },
}

/**
 * thread.completedByOther: someone else's job was completed (BE-113). The
 * pin says "Task completed" and so does the composer line.
 */
export const WorkerTaskCompleted: Story = {
  decorators: messagesStory({
    viewer: 'worker',
    thread: taskThread('worker', { canSend: false }, pendingItems),
    items: pendingItems,
    ...FRAME,
    task: storyTaskDetail({
      status: TaskStatus.Awarded,
      bookingStatus: TaskBookingStatus.Completed,
      quotes: [storyTaskQuote({ status: QuoteStatus.Pending })],
    }),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText("Task completed. You can't message here."),
    ).toBeVisible()
    await expect(canvas.getAllByText('Task completed')).toHaveLength(1)
    await expect(canvas.queryByRole('textbox')).toBeNull()
  },
}

/** zh-HK: the same line when someone else is booked. */
export const ZhHkWorkerBookedByOther: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/messages' } } },
  decorators: [
    ...messagesStory({
      viewer: 'worker',
      thread: taskThread('worker', { canSend: false }, pendingItems),
      items: pendingItems,
      ...FRAME,
      task: storyTaskDetail({
        status: TaskStatus.Awarded,
        bookingStatus: TaskBookingStatus.Booked,
        quotes: [storyTaskQuote({ status: QuoteStatus.Pending })],
      }),
    }),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('已由其他人預訂。你無法在此傳送訊息。'),
    ).toBeVisible()
    await expect(canvas.queryByRole('textbox')).toBeNull()
  },
}

/**
 * thread.locked: the poster's side once someone is booked (BE-113): this
 * worker's quote stays pending, but only an open task can accept one, so the
 * card has no Accept.
 */
export const OwnerBookedElsewhere: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    thread: taskThread('owner', { canSend: false }, pendingItems),
    items: pendingItems,
    ...FRAME,
    task: storyTaskDetail({
      status: TaskStatus.Awarded,
      quotes: storyQuotes(QuoteStatus.Pending, QuoteStatus.Accepted),
    }),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await within(await canvas.findByRole('log')).findByText('Awaiting reply')
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
    await expect(canvas.queryByRole('textbox')).toBeNull()
  },
}

/** thread.blocked: the viewer blocked the other person: the notice says so and offers no composer. */
export const BlockedByMe: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    thread: taskThread(
      'owner',
      { blockedByMe: true, canSend: false },
      ownerItems,
    ),
    items: ownerItems,
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'You blocked Jordan Lee. Unblock them to send messages.',
      ),
    ).toBeVisible()
  },
}

const PAUSED = 'Messaging is paused while this account or task is suspended.'

/** Jordan's account is suspended: the booking is frozen (BE-108). */
const frozenBooking = bookedTaskWith({
  bookedStart: '2030-06-10T14:00:00.000Z',
  bookedEnd: '2030-06-10T16:00:00.000Z',
  counterpartySuspension: {
    role: OrderPartyRole.Worker,
    name: 'Jordan Lee',
    canReopen: true,
  },
})

/**
 * thread.suspended: the booked worker's account is suspended, so `canSend`
 * is false and nothing needs the owner: the composer says messaging is
 * paused (not "once a quote is accepted"), and the menu has no booking
 * actions.
 */
export const SuspendedBooking: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    thread: taskThread('owner', { canSend: false }, ownerItems),
    items: ownerItems,
    ...FRAME,
    task: frozenBooking,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText(PAUSED)).toBeVisible()
    await expect(canvas.queryByRole('textbox')).toBeNull()
    await expect(
      canvas.queryByText('You can message here once a quote is accepted.'),
    ).toBeNull()
    await expect(canvasElement.querySelector('[data-bottom-pin]')).toBeNull()
  },
}

/**
 * thread.suspended before a booking: the owner's task Slashie suspended.
 * The quote card shows its status, with no Accept.
 */
export const SuspendedOpenTask: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    thread: taskThread(
      'owner',
      { canSend: false, otherParty: null, attention: null },
      pendingItems,
    ),
    items: pendingItems,
    ...FRAME,
    task: storyTaskDetail({
      suspension: { bySlashie: true, posterSuspended: false },
    }),
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText(PAUSED)).toBeVisible()
    const log = await canvas.findByRole('log')
    await expect(within(log).getByText('Awaiting reply')).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Accept' })).toBeNull()
  },
}

/** zh-HK: messaging paused while suspended. */
export const ZhHkSuspended: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/messages' } } },
  decorators: [
    ...messagesStory({
      viewer: 'owner',
      thread: taskThread('owner', { canSend: false }, ownerItems),
      items: ownerItems,
      ...FRAME,
      task: frozenBooking,
    }),
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        '帳戶或任務暫停期間，訊息功能會暫停。',
      ),
    ).toBeVisible()
  },
}

/**
 * A worker's Task cancelled and Task reopened flashes (BE-108) are plain
 * centred lines with the API's title and body, not cards.
 */
export const TaskCancelledAndReopenedLines: Story = {
  decorators: (() => {
    const quote = jordanQuote({ status: QuoteStatus.Pending })
    const items = [
      conversationFlash(
        'tr-2',
        FlashKind.TaskReopened,
        'Task reopened',
        'Alex reopened "Mount bookshelf on living room wall". Your quote is live again.',
        new Date().toISOString(),
        { quoteId: quote.id, quote },
      ),
      conversationFlash(
        'tc-1',
        FlashKind.TaskCancelled,
        'Task cancelled',
        'Alex cancelled "Mount bookshelf on living room wall".',
        new Date(Date.now() - 60_000).toISOString(),
        { quoteId: quote.id, quote },
      ),
      ...pendingItems,
    ]
    return messagesStory({
      viewer: 'worker',
      thread: taskThread('worker', { canSend: false }, items),
      items,
      ...FRAME,
    })
  })(),
  play: async ({ canvasElement }) => {
    const log = within(await within(canvasElement).findByRole('log'))
    for (const kind of [FlashKind.TaskCancelled, FlashKind.TaskReopened]) {
      await expect(
        canvasElement.querySelector(`[data-flash-line="${kind}"]`),
      ).not.toBeNull()
      await expect(
        canvasElement.querySelector(`[data-flash-card="${kind}"]`),
      ).toBeNull()
    }
    await expect(log.getByText('Task reopened')).toBeVisible()
    await expect(
      log.getByText(
        'Alex reopened "Mount bookshelf on living room wall". Your quote is live again.',
      ),
    ).toBeVisible()
    await expect(log.getByText('Task cancelled')).toBeVisible()
  },
}

/** thread.system: the Slashie announcements thread: read-only, no pins. */
export const Announcements: Story = {
  args: { threadId: 't-system' },
  decorators: messagesStory({
    viewer: 'owner',
    thread: systemThread(),
    items: systemAnnouncements(),
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        "Announcements from Slashie. You can't reply here.",
      ),
    ).toBeVisible()
    await expect(canvasElement.querySelector('[data-thread-pin]')).toBeNull()
    await expect(canvasElement.querySelector('[data-bottom-pin]')).toBeNull()
  },
}

/** A review prompt after the job: its line links to the review. */
export const ReviewPrompt: Story = {
  decorators: (() => {
    const items = [
      conversationFlash(
        'r-1',
        FlashKind.ReviewPrompt,
        'How did it go?',
        'Leave a review for Jordan Lee.',
        new Date().toISOString(),
        { orderId: 'order-detail-1' },
      ),
      ...ownerItems,
    ]
    return messagesStory({
      viewer: 'owner',
      thread: taskThread('owner', {}, items),
      items,
      ...BOOKED,
    })
  })(),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', {
        name: 'Leave a review',
      }),
    ).toBeVisible()
  },
}

/** A full page of history: Load earlier appears above the oldest message. */
export const LongHistory: Story = {
  decorators: (() => {
    const items = manyMessages('owner', 50)
    return messagesStory({
      viewer: 'owner',
      thread: taskThread('owner', {}, items),
      items,
      ...BOOKED,
    })
  })(),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', {
        name: 'Load earlier',
      }),
    ).toBeVisible()
  },
}

/** Long and multi-line messages wrap inside their bubbles. */
export const LongMessages: Story = {
  decorators: (() => {
    const items = [
      conversationMessage(
        'owner',
        'worker',
        'long-2',
        'Quick note before Saturday.\nI will park the van outside number 12 and need about two hours.\nIf the bookshelf has not been unpacked yet, please leave it flat in the hallway.',
        new Date().toISOString(),
      ),
      conversationMessage(
        'owner',
        'owner',
        'long-1',
        'Thank you. A very long unbroken link that must not stretch the bubble: https://example.com/guides/mounting-a-bookshelf-on-a-plasterboard-wall-with-the-right-fixings',
        new Date().toISOString(),
      ),
    ]
    return messagesStory({
      viewer: 'owner',
      thread: taskThread('owner', {}, items),
      items,
      ...BOOKED,
    })
  })(),
}

/** Phones: the conversation fills the screen. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: messagesStory({
    viewer: 'owner',
    thread: taskThread('owner', {}, ownerItems),
    items: ownerItems,
    task: bookedTask,
    height: '560px',
  }),
}

/** thread.loading: the request has not settled: skeleton bubbles, no header. */
export const Loading: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    threadRequest: 'loading',
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Loading messages…'),
    ).toBeInTheDocument()
    await expect(
      canvasElement.querySelector('[aria-busy="true"]'),
    ).not.toBeNull()
    await expect(canvas.queryByRole('log')).toBeNull()
  },
}

/** thread.none: desktop with no conversation picked. */
export const NothingPicked: Story = {
  args: { threadId: null },
  decorators: messagesStory({ viewer: 'owner', ...FRAME }),
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByText(
        'Choose a conversation to read it.',
      ),
    ).toBeVisible()
  },
}

/** thread.notFound: not your conversation (the API answers FORBIDDEN): no Try again, a way back. */
export const NotAvailable: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    threadRequest: 'forbidden',
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText("This conversation isn't available"),
    ).toBeVisible()
    await expect(
      canvas.getByText(
        'It may have been removed, or you no longer have access.',
      ),
    ).toBeVisible()
    await expect(canvas.queryByRole('button', { name: 'Try again' })).toBeNull()
    await expect(
      canvas.getByRole('link', { name: 'Back to messages' }),
    ).toHaveAttribute('href', '/messages')
  },
}

/** thread.loadError: the request failed: an error with Try again and a way back. */
export const LoadError: Story = {
  decorators: messagesStory({
    viewer: 'owner',
    threadRequest: 'failed',
    ...FRAME,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      "Couldn't load your messages.",
    )
    await expect(
      canvas.getByRole('button', { name: 'Try again' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Back to messages' }),
    ).toBeVisible()
  },
}
