import {
  Currency,
  FlashKind,
  OrderCloseKind,
  OrderRequestKind,
  OrderStatus,
  QuoteStatus,
  TaskBookingStatus,
  TaskStatus,
  ThreadAttentionKind,
  ThreadItemType,
  ThreadKind,
} from '@codegen/schema'
import type {
  ThreadFieldsFragment,
  ThreadItemFieldsFragment,
} from '@codegen/schema'

import {
  STORY_OWNER_ID,
  STORY_TASK_ID,
  STORY_WORKER_ID,
  storyTaskDetail,
  storyTaskOrder,
  storyTaskQuote,
} from '@/app/(task)/tasks/[slug]/helpers/taskDetailStoryFixtures'
import type { OrderItem } from '@/utils/orderHelpers'

import type { MessagesContextValue } from '../context/MessagesProvider'

const at = (daysAgo: number, h: number, m: number) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

const today = (h: number, m: number) => at(0, h, m)

const worker = {
  userId: 'u-worker',
  name: 'Sample Worker',
  avatarUrl: null,
  deleted: false,
}

type FlashQuote = NonNullable<ThreadItemFieldsFragment['quote']>

/** Far-future slots, so the accept dialog can always pick them. */
const baseQuote: FlashQuote = {
  id: 'q1',
  taskId: 'task-1',
  workerUserId: 'u-worker',
  status: QuoteStatus.Pending,
  workerSuspended: false,
  message: 'I can come on Saturday morning with my own tools.',
  price: { amount: 80, currency: Currency.Gbp },
  proposedSlots: [
    {
      id: 's1',
      start: '2030-10-17T09:00:00.000Z',
      end: '2030-10-17T11:00:00.000Z',
    },
    { id: 's2', start: '2030-10-18T14:00:00.000Z', end: null },
  ],
  worker: {
    id: 'u-worker',
    profile: { name: 'Sample Worker', avatarUrl: null },
  },
}

/** The quote a quote flash carries; override the status, price or text. */
export function storyFlashQuote(overrides: Partial<FlashQuote> = {}) {
  return { ...baseQuote, ...overrides }
}

export const quoteFlash: ThreadItemFieldsFragment = {
  id: 'i1',
  threadId: 't1',
  type: ThreadItemType.Flash,
  flashKind: FlashKind.QuoteReceived,
  title: 'New quote: £80',
  body: 'Sample Worker can come on Saturday morning.',
  imageUrl: null,
  isMine: false,
  taskId: 'task-1',
  quoteId: 'q1',
  orderId: null,
  createdAt: today(9, 5),
  author: null,
  quote: baseQuote,
}

export const reviewFlash: ThreadItemFieldsFragment = {
  ...quoteFlash,
  id: 'i4',
  flashKind: FlashKind.ReviewPrompt,
  title: 'How did it go?',
  body: 'Leave a review for Sample Worker.',
  quoteId: null,
  orderId: 'o1',
  createdAt: today(12, 0),
  quote: null,
}

export const theirMessage: ThreadItemFieldsFragment = {
  id: 'i2',
  threadId: 't1',
  type: ThreadItemType.Message,
  flashKind: null,
  title: null,
  body: 'Is there parking near the building?',
  imageUrl: null,
  isMine: false,
  taskId: 'task-1',
  quoteId: null,
  orderId: null,
  createdAt: today(9, 20),
  author: worker,
  quote: null,
}

export const myMessage: ThreadItemFieldsFragment = {
  ...theirMessage,
  id: 'i3',
  body: 'Yes, there is a visitor bay out front.',
  isMine: true,
  createdAt: today(9, 24),
  author: { ...worker, userId: 'u-me', name: 'You' },
}

export const sampleThreads: ThreadFieldsFragment[] = [
  {
    id: 't1',
    kind: ThreadKind.Task,
    title: 'Assemble a wardrobe',
    unreadCount: 2,
    canSend: true,
    blockedByMe: false,
    attention: null,
    updatedAt: myMessage.createdAt,
    task: {
      id: 'task-1',
      title: 'Assemble a wardrobe',
      status: TaskStatus.Awarded,
      poster: { id: STORY_OWNER_ID },
    },
    otherParty: worker,
    lastItem: theirMessage,
  },
  {
    id: 't2',
    kind: ThreadKind.Task,
    title: 'Garden tidy-up',
    unreadCount: 0,
    canSend: false,
    blockedByMe: false,
    attention: { kind: ThreadAttentionKind.CompareQuotes, count: 2 },
    updatedAt: today(8, 0),
    task: {
      id: 'task-2',
      title: 'Garden tidy-up',
      status: TaskStatus.Open,
      poster: { id: STORY_OWNER_ID },
    },
    otherParty: null,
    lastItem: {
      ...quoteFlash,
      threadId: 't2',
      id: 'i9',
      taskId: 'task-2',
      createdAt: today(8, 0),
    },
  },
  {
    id: 't3',
    kind: ThreadKind.System,
    title: 'Slashie',
    unreadCount: 0,
    canSend: false,
    blockedByMe: false,
    attention: null,
    updatedAt: today(7, 30),
    task: null,
    otherParty: null,
    lastItem: {
      ...quoteFlash,
      id: 'i10',
      threadId: 't3',
      flashKind: FlashKind.SystemAnnouncement,
      title: 'New: message workers in the app',
      taskId: null,
      quoteId: null,
      createdAt: today(7, 30),
    },
  },
]

export function messagesValue(
  overrides: Partial<MessagesContextValue> = {},
): MessagesContextValue {
  return {
    threads: sampleThreads,
    unreadCount: 2,
    loading: false,
    error: false,
    refetchThreads: () => {},
    ...overrides,
  }
}

/* Task conversations: the task owner (Alex) and the booked worker (Jordan),
   with the ids the task detail fixtures use, so the header menu can load the
   same task. */

export type MessagesViewer = 'owner' | 'worker'

export const STORY_THREAD_ID = 't-booked'
export const STORY_THREAD_TITLE = 'Mount bookshelf on living room wall'

/** The customer. */
const alex = {
  userId: STORY_OWNER_ID,
  name: 'Alex Chen',
  avatarUrl: null,
  deleted: false,
}
/** The worker. */
const jordan = {
  userId: STORY_WORKER_ID,
  name: 'Jordan Lee',
  avatarUrl: null,
  deleted: false,
}

/** The other person in the conversation, as the viewer sees them. */
export const otherPartyFor = (viewer: MessagesViewer) =>
  viewer === 'owner' ? jordan : alex

/** A chat message in the booked task thread; `from` is who wrote it. */
export function conversationMessage(
  viewer: MessagesViewer,
  from: MessagesViewer,
  id: string,
  body: string,
  createdAt: string,
): ThreadItemFieldsFragment {
  return {
    id,
    threadId: STORY_THREAD_ID,
    type: ThreadItemType.Message,
    flashKind: null,
    title: null,
    body,
    imageUrl: null,
    isMine: from === viewer,
    taskId: STORY_TASK_ID,
    quoteId: null,
    orderId: null,
    createdAt,
    author: from === 'owner' ? alex : jordan,
    quote: null,
  }
}

/** An event card in the booked task thread (quote, booking, review...). */
export function conversationFlash(
  id: string,
  flashKind: FlashKind,
  title: string,
  body: string,
  createdAt: string,
  overrides: Partial<ThreadItemFieldsFragment> = {},
): ThreadItemFieldsFragment {
  return {
    id,
    threadId: STORY_THREAD_ID,
    type: ThreadItemType.Flash,
    flashKind,
    title,
    body,
    imageUrl: null,
    isMine: false,
    taskId: STORY_TASK_ID,
    quoteId: null,
    orderId: null,
    createdAt,
    author: null,
    quote: null,
    ...overrides,
  }
}

/** The quote Jordan sent to Alex, in whatever state the story needs. */
export function jordanQuote(overrides: Partial<FlashQuote> = {}): FlashQuote {
  return storyFlashQuote({
    id: 'q-jordan',
    taskId: STORY_TASK_ID,
    workerUserId: STORY_WORKER_ID,
    price: { amount: 85, currency: Currency.Gbp },
    message: 'I can do this Saturday morning with my own tools.',
    worker: {
      id: STORY_WORKER_ID,
      profile: { name: 'Jordan Lee', avatarUrl: null },
    },
    ...overrides,
  })
}

/** Items newest first, as the API returns them: accepted quote, then chat. */
export function bookedConversation(
  viewer: MessagesViewer = 'owner',
): ThreadItemFieldsFragment[] {
  const accepted = jordanQuote({ status: QuoteStatus.Accepted })
  return [
    conversationMessage(
      viewer,
      'worker',
      'i-5',
      'I will bring the drill and the spirit level. See you then.',
      today(9, 42),
    ),
    conversationMessage(
      viewer,
      'owner',
      'i-4',
      'Great, the spare key is with the neighbour at number 14.',
      today(9, 30),
    ),
    conversationFlash(
      'i-3',
      FlashKind.QuoteAccepted,
      'Quote accepted',
      'Alex accepted Jordan’s quote of £85.',
      at(1, 16, 20),
      { quoteId: accepted.id, quote: accepted },
    ),
    conversationFlash(
      'i-2',
      FlashKind.QuoteReceived,
      'New quote: £85',
      'Jordan can come on Saturday morning.',
      at(1, 14, 5),
      { quoteId: accepted.id, quote: accepted, isMine: viewer === 'worker' },
    ),
  ]
}

/**
 * A task thread between Alex and Jordan; `lastItem` follows `items`. The task
 * is booked, unless the thread has nobody else (the poster before booking).
 */
export function taskThread(
  viewer: MessagesViewer = 'owner',
  overrides: Partial<ThreadFieldsFragment> = {},
  items: readonly ThreadItemFieldsFragment[] = bookedConversation(viewer),
): ThreadFieldsFragment {
  return {
    id: STORY_THREAD_ID,
    kind: ThreadKind.Task,
    title: STORY_THREAD_TITLE,
    unreadCount: 0,
    canSend: true,
    blockedByMe: false,
    attention: null,
    updatedAt: items[0]?.createdAt ?? today(9, 42),
    task: {
      id: STORY_TASK_ID,
      title: STORY_THREAD_TITLE,
      status:
        overrides.otherParty === null ? TaskStatus.Open : TaskStatus.Awarded,
      poster: { id: STORY_OWNER_ID },
    },
    otherParty: otherPartyFor(viewer),
    lastItem: items[0] ?? null,
    ...overrides,
  }
}

/** The poster's thread for a task cancelled before anyone was booked. */
export function cancelledTaskThread(): ThreadFieldsFragment {
  return taskThread('owner', {
    otherParty: null,
    canSend: false,
    task: {
      id: STORY_TASK_ID,
      title: STORY_THREAD_TITLE,
      status: TaskStatus.Cancelled,
      poster: { id: STORY_OWNER_ID },
    },
  })
}

/** The Slashie announcements thread: no task, no reply. */
export function systemThread(
  overrides: Partial<ThreadFieldsFragment> = {},
): ThreadFieldsFragment {
  const announcement = systemAnnouncements()[0]
  return {
    id: 't-system',
    kind: ThreadKind.System,
    title: 'Slashie',
    unreadCount: 0,
    canSend: false,
    blockedByMe: false,
    attention: null,
    updatedAt: announcement.createdAt,
    task: null,
    otherParty: null,
    lastItem: announcement,
    ...overrides,
  }
}

/** Announcements newest first, with and without a picture. */
export function systemAnnouncements(): ThreadItemFieldsFragment[] {
  return [
    {
      ...conversationFlash(
        'sys-2',
        FlashKind.SystemAnnouncement,
        'New: message workers in the app',
        'Once you accept a quote you can chat with the worker right here in Messages.',
        today(7, 30),
        { taskId: null },
      ),
      threadId: 't-system',
    },
    {
      ...conversationFlash(
        'sys-1',
        FlashKind.SystemAnnouncement,
        'Welcome to Slashie',
        'Post a task, compare quotes and book someone local.',
        at(6, 10, 0),
        { taskId: null },
      ),
      threadId: 't-system',
    },
  ]
}

/** `count` chat messages, newest first, alternating who wrote them. */
export function manyMessages(
  viewer: MessagesViewer,
  count: number,
): ThreadItemFieldsFragment[] {
  return Array.from({ length: count }, (_, index) => {
    const from: MessagesViewer = index % 2 === 0 ? 'worker' : 'owner'
    return conversationMessage(
      viewer,
      from,
      `bulk-${index}`,
      from === 'worker'
        ? `Update ${count - index}: on my way, running a few minutes late.`
        : `Thanks for the update ${count - index}, no problem at all.`,
      at(2 + Math.floor(index / 10), 18 - (index % 10), 0),
    )
  })
}

/* The task behind a thread's pins, in each state the pins show. Alex owns
   the task; Jordan quoted £85 and Sam £95. */

/** A booked slot far in the future (before the start: nothing to close). */
export const FUTURE_START = '2030-06-10T14:00:00.000Z'
export const FUTURE_END = '2030-06-10T16:00:00.000Z'
const ACTED_AT = '2026-10-15T10:00:00.000Z'
// The order query reads `failedReason` on your own close action.
export const markedDone = {
  kind: OrderCloseKind.Done,
  at: ACTED_AT,
  failedReason: null,
}
export const markedFailed = {
  kind: OrderCloseKind.Failed,
  at: ACTED_AT,
  failedReason: null,
}

/** What `thread.attention` says waits on the viewer. */
export const needs = (
  kind: ThreadAttentionKind,
  count: number | null = null,
) => ({
  kind,
  count,
})

const sam = {
  id: 'worker-detail-2',
  profile: { name: 'Sam Taylor', avatarUrl: null },
  worker: { id: 'worker-profile-2', isVerified: false },
}

/** Jordan's quote (when given, in `mine`) and Sam's (in `other`). */
export function storyQuotes(mine: QuoteStatus | null, other: QuoteStatus) {
  return [
    ...(mine ? [storyTaskQuote({ status: mine })] : []),
    storyTaskQuote({
      id: 'quote-detail-2',
      workerUserId: 'worker-detail-2',
      status: other,
      price: { amount: 95, currency: Currency.Gbp },
      worker: sam,
    }),
  ]
}

/** `count` live quotes from different workers, cheapest last. */
export function manyLiveQuotes(count: number) {
  const names = [
    'Jordan Lee',
    'Sam Taylor',
    'Priya Shah',
    'Ben Okafor',
    'Mia Wong',
  ]
  return Array.from({ length: count }, (_, index) =>
    storyTaskQuote({
      id: `quote-many-${index}`,
      workerUserId: `worker-many-${index}`,
      price: { amount: 120 - index * 10, currency: Currency.Gbp },
      worker: {
        id: `worker-many-${index}`,
        profile: { name: names[index % names.length], avatarUrl: null },
        worker: { id: `worker-profile-many-${index}`, isVerified: false },
      },
    }),
  )
}

/** Jordan booked at £85 (cash); the order says where the booking stands. */
export function bookedTask(order: Partial<OrderItem> = {}) {
  return storyTaskDetail({
    status: TaskStatus.Awarded,
    bookingStatus: TaskBookingStatus.Booked,
    // The other quotes stay PENDING once someone is booked (BE-113).
    quotes: storyQuotes(QuoteStatus.Accepted, QuoteStatus.Pending),
    orders: [storyTaskOrder(order)],
  })
}

/** A booking with a reschedule or cancellation waiting, asked by `by`. */
export function requestedOrder(
  kind: OrderRequestKind,
  by: string,
): Partial<OrderItem> {
  return {
    status:
      kind === OrderRequestKind.Reschedule
        ? OrderStatus.Rescheduling
        : OrderStatus.CancelRequested,
    bookedStart: FUTURE_START,
    bookedEnd: FUTURE_END,
    pendingRequest: {
      kind,
      requestedByUserId: by,
      requestedAt: ACTED_AT,
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

/** Sam posted a task Alex is doing. */
const samParty = {
  userId: 'user-sam',
  name: 'Sam Taylor',
  avatarUrl: null,
  deleted: false,
}
/** Chloé posted a task Alex quoted on (an accent for the search to ignore). */
const chloeParty = {
  userId: 'user-chloe',
  name: 'Chloé Martin',
  avatarUrl: null,
  deleted: false,
}

/**
 * Alex's inbox with a conversation for each filter: two tasks he posted (a
 * booked one with unread messages, an open one with quotes to compare), two
 * he works on (one to mark Done, one he quoted on with an unread reply) and
 * the Slashie thread. Most recent first; `unreadCount` of the context: 3.
 */
export function mixedInbox(): ThreadFieldsFragment[] {
  /** The thread's title and its task share the task's title, as from the API. */
  const forTask = (
    id: string,
    title: string,
    status: TaskStatus,
    poster: string,
  ) => ({
    title,
    task: { id: `task-${id}`, title, status, poster: { id: poster } },
  })
  return [
    taskThread('owner', { id: 'inbox-bookshelf', unreadCount: 2 }, [
      conversationMessage(
        'owner',
        'worker',
        'inbox-1',
        'I will bring the drill and the spirit level. See you then.',
        today(9, 42),
      ),
    ]),
    taskThread(
      'owner',
      {
        id: 'inbox-garden',
        otherParty: null,
        canSend: false,
        attention: needs(ThreadAttentionKind.CompareQuotes, 2),
        ...forTask('garden', 'Garden tidy-up', TaskStatus.Open, STORY_OWNER_ID),
      },
      [
        conversationFlash(
          'inbox-2',
          FlashKind.QuoteReceived,
          'New quote: £80',
          'Sam can come on Saturday morning.',
          today(8, 0),
        ),
      ],
    ),
    systemThread(),
    taskThread(
      'owner',
      {
        id: 'inbox-tap',
        otherParty: samParty,
        attention: needs(ThreadAttentionKind.MarkDone),
        ...forTask(
          'tap',
          'Fix a leaking kitchen tap',
          TaskStatus.Awarded,
          samParty.userId,
        ),
      },
      [
        conversationMessage(
          'owner',
          'worker',
          'inbox-3',
          'The tap is fixed, thanks. Please mark it Done.',
          at(1, 17, 5),
        ),
      ],
    ),
    taskThread(
      'owner',
      {
        id: 'inbox-fence',
        otherParty: chloeParty,
        canSend: false,
        unreadCount: 1,
        ...forTask(
          'fence',
          'Paint the garden fence',
          TaskStatus.Open,
          chloeParty.userId,
        ),
      },
      [
        conversationFlash(
          'inbox-4',
          FlashKind.QuoteReceived,
          'Quote sent: £60',
          'You offered to paint the fence on Saturday.',
          at(2, 10, 0),
          { isMine: true },
        ),
      ],
    ),
  ]
}
