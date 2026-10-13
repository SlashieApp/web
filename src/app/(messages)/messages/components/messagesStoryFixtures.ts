import {
  Currency,
  FlashKind,
  QuoteStatus,
  ThreadItemType,
  ThreadKind,
} from '@codegen/schema'
import type {
  ThreadFieldsFragment,
  ThreadItemFieldsFragment,
} from '@codegen/schema'

import type { MessagesContextValue } from '../context/MessagesProvider'

const today = (h: number, m: number) => {
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

const worker = {
  userId: 'u-worker',
  name: 'Sample Worker',
  avatarUrl: null,
  deleted: false,
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
  quote: {
    id: 'q1',
    taskId: 'task-1',
    workerUserId: 'u-worker',
    status: QuoteStatus.Pending,
    message: 'I can come on Saturday morning with my own tools.',
    price: { amount: 80, currency: Currency.Gbp },
    proposedSlots: [
      {
        id: 's1',
        start: '2026-10-17T09:00:00.000Z',
        end: '2026-10-17T11:00:00.000Z',
      },
      { id: 's2', start: '2026-10-18T14:00:00.000Z', end: null },
    ],
    worker: {
      id: 'u-worker',
      profile: { name: 'Sample Worker', avatarUrl: null },
    },
  },
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
    updatedAt: myMessage.createdAt,
    task: { id: 'task-1', title: 'Assemble a wardrobe' },
    otherParty: worker,
    lastItem: theirMessage,
  },
  {
    id: 't2',
    kind: ThreadKind.Task,
    title: 'Garden tidy-up',
    unreadCount: 0,
    canSend: true,
    blockedByMe: false,
    updatedAt: today(8, 0),
    task: { id: 'task-2', title: 'Garden tidy-up' },
    otherParty: null,
    lastItem: {
      ...myMessage,
      threadId: 't2',
      id: 'i9',
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
