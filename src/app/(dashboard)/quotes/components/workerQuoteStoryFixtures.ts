import { OrderStatus } from '@codegen/schema'

import type { TaskItem, TaskQuoteItem } from '@/utils/dashboardHelpers'
import type { OrderItem } from '@/utils/orderHelpers'

import type { WorkerQuoteRow } from '../../helpers/workerQuoteJobs'

export const STORY_WORKER_ID = 'worker-story-1'
export const STORY_CUSTOMER_ID = 'customer-story-1'

const STORY_THUMBNAIL =
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop'

export function storyTask(overrides: Partial<TaskItem> = {}): TaskItem {
  return {
    id: 'task-story-1',
    title: 'Mount bookshelf on living room wall',
    description: 'Need someone with a drill and spirit level.',
    category: 'HANDYMAN',
    budget: {
      amount: 120,
      currency: 'GBP',
      type: 'ONE_OFF',
      paymentMethod: 'CASH',
    },
    datetime: { date: '2026-06-10', time: '14:00', type: 'EXACT' },
    contactMethod: 'PHONE',
    images: [STORY_THUMBNAIL],
    status: 'OPEN',
    completedAt: null,
    confirmedAt: null,
    createdAt: '2026-05-28T10:00:00.000Z',
    location: {
      lat: 51.5074,
      lng: -0.1278,
      name: 'Westminster',
      address: null,
    },
    poster: { id: STORY_CUSTOMER_ID },
    quotes: [],
    ...overrides,
  } as TaskItem
}

export function storyQuote(
  overrides: Partial<TaskQuoteItem> = {},
): TaskQuoteItem {
  return {
    id: 'quote-story-1',
    taskId: 'task-story-1',
    workerUserId: STORY_WORKER_ID,
    price: { amount: 85, currency: 'GBP' },
    message: 'I can do this Saturday morning with my own tools.',
    status: 'PENDING',
    createdAt: '2026-05-29T14:30:00.000Z',
    ...overrides,
  } as TaskQuoteItem
}

export function storyOrder(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: 'order-story-1',
    taskId: 'task-story-1',
    quoteId: 'quote-story-1',
    customerUserId: STORY_CUSTOMER_ID,
    workerUserId: STORY_WORKER_ID,
    status: OrderStatus.Active,
    agreedPrice: { amount: 85, currency: 'GBP' },
    snapshot: {
      title: 'Mount bookshelf on living room wall',
      description: 'Need someone with a drill and spirit level.',
      category: 'HANDYMAN',
      location: {
        lat: 51.5074,
        lng: -0.1278,
        name: 'Westminster',
        address: '12 Example Street',
      },
      datetime: { date: '2026-06-10', time: '14:00', type: 'EXACT' },
      contactMethod: 'PHONE',
      quoteMessage: 'I can do this Saturday morning with my own tools.',
      budgetAmount: 120,
      paymentMethod: 'CASH',
    },
    bookedStart: '2026-06-10T14:00:00.000Z',
    bookedEnd: null,
    pendingRequest: null,
    myCloseAction: null,
    counterpartyCloseAction: null,
    oneSidedCancelUntil: null,
    autoDoneAt: null,
    createdAt: '2026-06-01T09:00:00.000Z',
    closedAt: null,
    ...overrides,
  } as OrderItem
}

export function storyQuoteRow(
  overrides: Partial<WorkerQuoteRow> = {},
): WorkerQuoteRow {
  return {
    task: storyTask(),
    quote: storyQuote(),
    workerOrder: null,
    ...overrides,
  }
}
