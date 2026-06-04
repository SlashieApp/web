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
    acceptedWorkerCap: 1,
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
      name: 'Westminster, London',
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
        name: 'Westminster, London',
        address: '12 Example Street',
      },
      datetime: { date: '2026-06-10', time: '14:00', type: 'EXACT' },
      contactMethod: 'PHONE',
      quoteMessage: 'I can do this Saturday morning with my own tools.',
      budgetAmount: 120,
      paymentMethod: 'CASH',
    },
    createdAt: '2026-06-01T09:00:00.000Z',
    workCompletedAt: null,
    workerPaymentAcknowledgedAt: null,
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

/** Mixed rows for filter chip counts and stages. */
export function storyQuoteRowsMixed(): WorkerQuoteRow[] {
  return [
    storyQuoteRow({
      task: storyTask({ id: 'task-pending', title: 'Garden tidy-up' }),
      quote: storyQuote({
        id: 'quote-pending',
        taskId: 'task-pending',
        status: 'PENDING',
        message: 'Happy to clear beds and dispose of green waste.',
      }),
    }),
    storyQuoteRow({
      task: storyTask({ id: 'task-booked', title: 'IKEA desk assembly' }),
      quote: storyQuote({
        id: 'quote-booked',
        taskId: 'task-booked',
        status: 'ACCEPTED',
      }),
      workerOrder: storyOrder({
        id: 'order-booked',
        taskId: 'task-booked',
        quoteId: 'quote-booked',
        status: OrderStatus.Active,
      }),
    }),
    storyQuoteRow({
      task: storyTask({ id: 'task-done', title: 'Paint hallway' }),
      quote: storyQuote({
        id: 'quote-done',
        taskId: 'task-done',
        status: 'ACCEPTED',
      }),
      workerOrder: storyOrder({
        id: 'order-done',
        taskId: 'task-done',
        quoteId: 'quote-done',
        status: OrderStatus.Closed,
        closedAt: '2026-05-20T16:00:00.000Z',
      }),
    }),
    storyQuoteRow({
      task: storyTask({ id: 'task-ended', title: 'Move sofa upstairs' }),
      quote: storyQuote({
        id: 'quote-ended',
        taskId: 'task-ended',
        status: 'DECLINED',
        message: null,
      }),
    }),
  ]
}
