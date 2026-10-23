import {
  Currency,
  LoginMethod,
  OrderStatus,
  QuoteStatus,
  TaskContactMethod,
  TaskEditableField,
  TaskTimelineEventType,
  UserLanguage,
} from '@codegen/schema'
import type { MeQuery } from '@codegen/schema'

import type { StoryResponse } from '@/app/(auth)/helpers/authStoryDecorator'
import type { OrderItem } from '@/utils/orderHelpers'

import type { TaskDetailRecord } from './taskDetailUtils'

export const STORY_TASK_ID = 'task-detail-story-1'
export const STORY_OWNER_ID = 'owner-detail-1'
export const STORY_WORKER_ID = 'worker-detail-1'
/** Signed in, no worker profile, not the poster. */
export const STORY_VIEWER_ID = 'viewer-detail-3'

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
    categories: ['HANDYMAN'],
    budget: {
      amount: 120,
      currency: Currency.Gbp,
      type: 'ONE_OFF',
      paymentMethod: 'CASH',
    },
    datetime: { date: '2026-06-10', time: '14:00', type: 'EXACT' },
    images: [
      STORY_THUMBNAIL,
      STORY_THUMBNAIL,
      STORY_THUMBNAIL,
      STORY_THUMBNAIL,
    ],
    status: 'OPEN',
    views: 12,
    location: {
      lat: 51.5074,
      lng: -0.1278,
      name: 'Westminster',
      address: '12 Example Street, London SW1A 1AA',
    },
    poster: {
      id: STORY_OWNER_ID,
      email: 'alex@example.com',
      profile: {
        name: 'Alex Chen',
        avatarUrl: STORY_AVATAR,
        contactNumber: '+44 7700 900123',
      },
    },
    timeline: [
      storyTimelineEvent({
        type: TaskTimelineEventType.TaskCreated,
        timestamp: '2026-05-28T10:00:00.000Z',
        actor: STORY_ALEX,
      }),
    ],
    orders: [],
    suspension: null,
    quotes: baseQuotes,
    ...overrides,
  } as TaskDetailRecord
}

type StoryTimelineEvent = TaskDetailRecord['timeline'][number]

/** The poster and the worker as Activity names them. */
export const STORY_ALEX = { id: STORY_OWNER_ID, profile: { name: 'Alex Chen' } }
export const STORY_JORDAN = {
  id: STORY_WORKER_ID,
  profile: { name: 'Jordan Lee' },
}
const STORY_SAM = { id: 'worker-detail-2', profile: { name: 'Sam Taylor' } }

/** One Activity event; nobody acted unless `actor` says who. */
export function storyTimelineEvent(
  overrides: Partial<StoryTimelineEvent> & Pick<StoryTimelineEvent, 'type'>,
): StoryTimelineEvent {
  return {
    timestamp: '2026-05-28T10:00:00.000Z',
    byViewer: false,
    changedFields: [],
    suspensionReason: null,
    actor: null,
    worker: null,
    ...overrides,
  }
}

const at = (day: number, time: string) =>
  `2026-06-${String(day).padStart(2, '0')}T${time}:00.000Z`

/**
 * A job from post to review, as the owner (Alex) reads it: every line, with
 * names. Jordan was booked over Sam.
 */
export function storyOwnerTimeline(): StoryTimelineEvent[] {
  const E = TaskTimelineEventType
  const mine = { byViewer: true, actor: STORY_ALEX }
  return [
    storyTimelineEvent({
      type: E.TaskCreated,
      timestamp: at(1, '09:00'),
      ...mine,
    }),
    storyTimelineEvent({
      type: E.TaskUpdated,
      timestamp: at(1, '09:30'),
      changedFields: [TaskEditableField.Budget, TaskEditableField.Datetime],
      ...mine,
    }),
    storyTimelineEvent({
      type: E.QuoteSent,
      timestamp: at(1, '11:15'),
      actor: STORY_JORDAN,
      worker: STORY_JORDAN,
    }),
    storyTimelineEvent({
      type: E.QuoteSent,
      timestamp: at(1, '12:40'),
      actor: STORY_SAM,
      worker: STORY_SAM,
    }),
    storyTimelineEvent({
      type: E.QuoteUpdated,
      timestamp: at(1, '13:05'),
      actor: STORY_JORDAN,
      worker: STORY_JORDAN,
    }),
    storyTimelineEvent({
      type: E.QuoteAccepted,
      timestamp: at(2, '08:20'),
      ...mine,
      worker: STORY_JORDAN,
    }),
    storyTimelineEvent({
      type: E.QuoteNotSelected,
      timestamp: at(2, '08:20'),
      worker: STORY_SAM,
    }),
    storyTimelineEvent({
      type: E.RescheduleRequested,
      timestamp: at(3, '17:45'),
      actor: STORY_JORDAN,
      worker: STORY_JORDAN,
    }),
    storyTimelineEvent({
      type: E.RescheduleConfirmed,
      timestamp: at(3, '18:02'),
      ...mine,
      worker: STORY_JORDAN,
    }),
    storyTimelineEvent({
      type: E.OrderMarkedDone,
      timestamp: at(10, '16:30'),
      actor: STORY_JORDAN,
      worker: STORY_JORDAN,
    }),
    storyTimelineEvent({
      type: E.OrderMarkedDone,
      timestamp: at(10, '19:10'),
      ...mine,
      worker: STORY_JORDAN,
    }),
    storyTimelineEvent({
      type: E.OrderCompleted,
      timestamp: at(10, '19:10'),
      worker: STORY_JORDAN,
    }),
    storyTimelineEvent({
      type: E.ReviewLeft,
      timestamp: at(11, '10:00'),
      ...mine,
      worker: STORY_JORDAN,
    }),
  ]
}

/** The same job as the booked worker (Jordan) reads it: Sam's quote has no name. */
export function storyWorkerTimeline(): StoryTimelineEvent[] {
  const E = TaskTimelineEventType
  const mine = { byViewer: true, actor: STORY_JORDAN, worker: STORY_JORDAN }
  return [
    storyTimelineEvent({
      type: E.TaskCreated,
      timestamp: at(1, '09:00'),
      actor: STORY_ALEX,
    }),
    storyTimelineEvent({
      type: E.TaskUpdated,
      timestamp: at(1, '09:30'),
      changedFields: [TaskEditableField.Budget, TaskEditableField.Datetime],
      actor: STORY_ALEX,
    }),
    storyTimelineEvent({
      type: E.QuoteSent,
      timestamp: at(1, '11:15'),
      ...mine,
    }),
    storyTimelineEvent({ type: E.QuoteSent, timestamp: at(1, '12:40') }),
    storyTimelineEvent({
      type: E.QuoteUpdated,
      timestamp: at(1, '13:05'),
      ...mine,
    }),
    storyTimelineEvent({
      type: E.QuoteAccepted,
      timestamp: at(2, '08:20'),
      actor: STORY_ALEX,
      worker: STORY_JORDAN,
    }),
    storyTimelineEvent({
      type: E.RescheduleRequested,
      timestamp: at(3, '17:45'),
      ...mine,
    }),
    storyTimelineEvent({
      type: E.RescheduleConfirmed,
      timestamp: at(3, '18:02'),
      actor: STORY_ALEX,
      worker: STORY_JORDAN,
    }),
    storyTimelineEvent({
      type: E.OrderMarkedDone,
      timestamp: at(10, '16:30'),
      ...mine,
    }),
    storyTimelineEvent({
      type: E.OrderMarkedDone,
      timestamp: at(10, '19:10'),
      actor: STORY_ALEX,
      worker: STORY_JORDAN,
    }),
    storyTimelineEvent({
      type: E.OrderCompleted,
      timestamp: at(10, '19:10'),
      worker: STORY_JORDAN,
    }),
  ]
}

/**
 * An open task as a guest or another worker reads it: the poster's lines,
 * and quotes with no name on them.
 */
export function storyPublicTimeline(): StoryTimelineEvent[] {
  const E = TaskTimelineEventType
  return [
    storyTimelineEvent({
      type: E.TaskCreated,
      timestamp: at(1, '09:00'),
      actor: STORY_ALEX,
    }),
    storyTimelineEvent({
      type: E.TaskUpdated,
      timestamp: at(1, '09:30'),
      changedFields: [TaskEditableField.Budget],
      actor: STORY_ALEX,
    }),
    storyTimelineEvent({ type: E.QuoteSent, timestamp: at(1, '11:15') }),
    storyTimelineEvent({ type: E.QuoteSent, timestamp: at(1, '12:40') }),
    storyTimelineEvent({ type: E.QuoteWithdrawn, timestamp: at(1, '15:00') }),
  ]
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
    workerSuspended: false,
    // Far-future so the accept dialog can pick them in stories.
    proposedSlots: [
      {
        id: 'slot-1',
        start: '2030-06-10T09:00:00.000Z',
        end: '2030-06-10T11:00:00.000Z',
      },
      { id: 'slot-2', start: '2030-06-11T14:00:00.000Z', end: null },
    ],
    worker: {
      id: STORY_WORKER_ID,
      profile: { name: 'Jordan Lee', avatarUrl: STORY_AVATAR },
      worker: { id: 'worker-profile-1', isVerified: true },
    },
    ...overrides,
  } as TaskDetailRecord['quotes'][number]
}

/**
 * Another worker's live quote as anyone but the owner gets it (BE-105): the
 * price, times and message, with no worker id and no worker.
 */
export function storyPublicQuote(
  overrides: Partial<TaskDetailRecord['quotes'][number]> = {},
): TaskDetailRecord['quotes'][number] {
  return storyTaskQuote({
    id: 'quote-public-1',
    workerUserId: null,
    worker: null,
    status: QuoteStatus.Pending,
    ...overrides,
  })
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
    snapshot: {
      title: 'Mount bookshelf on living room wall',
      description: 'Need a worker to mount one IKEA bookshelf safely.',
      categories: ['HANDYMAN'],
      location: {
        lat: 51.5074,
        lng: -0.1278,
        name: 'Westminster',
        address: '12 Example Street, London SW1A 1AA',
      },
      datetime: { date: '2026-06-10', time: '14:00', type: 'EXACT' },
      contactMethod: 'PHONE',
      quoteMessage: 'I can do this Saturday morning with my own tools.',
      budgetAmount: 120,
      paymentMethod: 'CASH',
    },
    // In the past, so booked stories show Done/Failed by default.
    bookedStart: '2026-06-10T14:00:00.000Z',
    bookedEnd: '2026-06-10T16:00:00.000Z',
    pendingRequest: null,
    myCloseAction: null,
    counterpartyCloseAction: null,
    autoDoneAt: null,
    createdAt: '2026-06-01T09:00:00.000Z',
    closedAt: null,
    counterpartySuspension: null,
    ...overrides,
  } as OrderItem
}

export type TaskDetailStoryViewer =
  | 'owner'
  | 'worker'
  | 'customer'
  | 'nonWorker'
  | 'visitor'

const STORY_PEOPLE = {
  owner: { id: STORY_OWNER_ID, email: 'alex@example.com', name: 'Alex Chen' },
  worker: {
    id: STORY_WORKER_ID,
    email: 'jordan@example.com',
    name: 'Jordan Lee',
  },
  nonWorker: {
    id: STORY_VIEWER_ID,
    email: 'casey@example.com',
    name: 'Casey Morgan',
  },
}

export function storyMe(
  viewer: Exclude<TaskDetailStoryViewer, 'visitor'>,
): NonNullable<MeQuery['me']> {
  const person = STORY_PEOPLE[viewer === 'customer' ? 'owner' : viewer]
  const base = {
    id: person.id,
    email: person.email,
    emailVerified: true,
    phoneVerified: true,
    phoneVerifiedAt: '2025-01-01T00:00:00.000Z',
    createdAt: '2025-01-01T00:00:00.000Z',
    disabled: false,
    enabledLoginMethods: [LoginMethod.Password],
    profile: {
      name: person.name,
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
      language: UserLanguage.En,
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
            locationAddress: 'London',
            profile: { name: 'Jordan Lee' },
            // Required by isWorkerSetupComplete — without it worker stories
            // collapse into the "set up worker profile" state.
            setupProgress: { isComplete: true },
          }
        : null,
  }
  return base as unknown as NonNullable<MeQuery['me']>
}

export type TaskDetailStoryConfig = {
  viewer: TaskDetailStoryViewer
  task?: TaskDetailRecord
  order?: OrderItem | null
  /** The owner's preview: the page as a signed-out visitor gets it. */
  viewAs?: 'guest'
  /**
   * Canned answers by operation name (a mutation such as `ReopenTask`);
   * anything else never resolves.
   */
  responses?: Record<string, StoryResponse>
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
