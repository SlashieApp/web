import {
  Currency,
  LoginMethod,
  OrderStatus,
  QuoteStatus,
  TaskContactMethod,
  TaskStatus,
} from '@codegen/schema'
import type { MeQuery, TaskQuery } from '@codegen/schema'

import type { OrderItem } from '@/utils/orderHelpers'

import type { TaskDetailRecord } from './taskDetailUtils'

export const STORY_TASK_ID = 'task-detail-story-1'
export const STORY_OWNER_ID = 'owner-detail-1'
export const STORY_WORKER_ID = 'worker-detail-1'

const STORY_THUMBNAIL =
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop'

const STORY_AVATAR =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop'

export function storyTaskDetail(
  overrides: Partial<TaskDetailRecord> = {},
): TaskDetailRecord {
  const baseQuotes = [
    storyTaskQuote({
      id: 'quote-detail-1',
      workerUserId: STORY_WORKER_ID,
      status: QuoteStatus.Pending,
      price: { amount: 85, currency: Currency.Gbp },
      message: 'I can do this Saturday morning with my own tools.',
      worker: {
        id: STORY_WORKER_ID,
        profile: { name: 'Jordan Lee', avatarUrl: STORY_AVATAR },
        worker: { id: 'worker-profile-1', isVerified: true },
      },
    }),
    storyTaskQuote({
      id: 'quote-detail-2',
      workerUserId: 'worker-detail-2',
      status: QuoteStatus.Pending,
      price: { amount: 95, currency: Currency.Gbp },
      message: 'Available weekday evenings. Happy to bring a ladder.',
      worker: {
        id: 'worker-detail-2',
        profile: { name: 'Sam Taylor', avatarUrl: null },
        worker: { id: 'worker-profile-2', isVerified: false },
      },
    }),
  ]

  return {
    id: STORY_TASK_ID,
    title: 'Mount bookshelf on living room wall',
    description:
      'Need a worker to mount one IKEA bookshelf safely. Wall is plasterboard; fixings supplied.',
    category: 'HANDYMAN',
    acceptedWorkerCap: 1,
    budget: {
      amount: 120,
      currency: Currency.Gbp,
      type: 'ONE_OFF',
      paymentMethod: 'CASH',
    },
    datetime: { date: '2026-06-10', time: '14:00', type: 'EXACT' },
    contactMethod: 'PHONE',
    images: [
      STORY_THUMBNAIL,
      STORY_THUMBNAIL,
      STORY_THUMBNAIL,
      STORY_THUMBNAIL,
    ],
    status: 'OPEN',
    completedAt: null,
    confirmedAt: null,
    createdAt: '2026-05-28T10:00:00.000Z',
    location: {
      lat: 51.5074,
      lng: -0.1278,
      name: 'Westminster, London',
      address: '12 Example Street, London SW1A 1AA',
    },
    poster: {
      id: STORY_OWNER_ID,
      profile: { name: 'Alex Chen', avatarUrl: STORY_AVATAR },
    },
    posterContact: {
      method: 'PHONE',
      phone: '+44 7700 900123',
      email: 'alex@example.com',
    },
    quotes: baseQuotes,
    ...overrides,
  } as TaskDetailRecord
}

export function storyTaskQuote(
  overrides: Partial<TaskDetailRecord['quotes'][number]> = {},
): TaskDetailRecord['quotes'][number] {
  return {
    id: 'quote-detail-1',
    taskId: STORY_TASK_ID,
    workerUserId: STORY_WORKER_ID,
    price: { amount: 85, currency: Currency.Gbp },
    message: 'I can do this Saturday morning with my own tools.',
    status: QuoteStatus.Pending,
    createdAt: '2026-05-29T14:30:00.000Z',
    worker: {
      id: STORY_WORKER_ID,
      profile: { name: 'Jordan Lee', avatarUrl: STORY_AVATAR },
      worker: { id: 'worker-profile-1', isVerified: true },
    },
    ...overrides,
  } as TaskDetailRecord['quotes'][number]
}

export function storyTaskOrder(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: 'order-detail-1',
    taskId: STORY_TASK_ID,
    quoteId: 'quote-detail-1',
    customerUserId: STORY_OWNER_ID,
    workerUserId: STORY_WORKER_ID,
    status: OrderStatus.Active,
    agreedPrice: { amount: 85, currency: Currency.Gbp },
    completionVerificationCode: '482913',
    snapshot: {
      title: 'Mount bookshelf on living room wall',
      description: 'Need a worker to mount one IKEA bookshelf safely.',
      category: 'HANDYMAN',
      location: {
        lat: 51.5074,
        lng: -0.1278,
        name: 'Westminster, London',
        address: '12 Example Street, London SW1A 1AA',
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

export type TaskDetailStoryViewer = 'owner' | 'worker' | 'customer' | 'visitor'

export function storyMe(
  viewer: Exclude<TaskDetailStoryViewer, 'visitor'>,
): NonNullable<MeQuery['me']> {
  const base = {
    id:
      viewer === 'owner' || viewer === 'customer'
        ? STORY_OWNER_ID
        : STORY_WORKER_ID,
    email:
      viewer === 'owner' || viewer === 'customer'
        ? 'alex@example.com'
        : 'jordan@example.com',
    emailVerified: true,
    phoneVerified: true,
    phoneVerifiedAt: '2025-01-01T00:00:00.000Z',
    createdAt: '2025-01-01T00:00:00.000Z',
    enabledLoginMethods: [LoginMethod.Password],
    profile: {
      name:
        viewer === 'owner' || viewer === 'customer'
          ? 'Alex Chen'
          : 'Jordan Lee',
      contactNumber: '+44 7700 900123',
      avatarUrl: STORY_AVATAR,
      bio: null,
      dateOfBirth: null,
      defaultPreferredContactMethod: TaskContactMethod.Phone,
      emailVerified: true,
      phoneVerified: true,
    },
    settings: {
      isProfilePrivate: false,
      marketingEmails: false,
    },
    workerEligibility: true,
    worker:
      viewer === 'worker'
        ? {
            id: 'worker-profile-1',
            legalName: 'Jordan Lee',
            bio: null,
            tagline: null,
            yearsExperience: 5,
            isVerified: true,
            tasksCompletedCount: 42,
            locationAddress: 'London',
            profile: { name: 'Jordan Lee' },
          }
        : null,
  }
  return base as unknown as NonNullable<MeQuery['me']>
}

export type TaskDetailStoryConfig = {
  viewer: TaskDetailStoryViewer
  task?: TaskDetailRecord
  order?: NonNullable<TaskQuery['task']>['viewerOrder'] | null
}

export function defaultTaskDetailStoryConfig(
  overrides: Partial<TaskDetailStoryConfig> = {},
): TaskDetailStoryConfig {
  return {
    viewer: 'owner',
    task: storyTaskDetail(),
    order: null,
    ...overrides,
  }
}
