import { Currency, OrderStatus, QuoteStatus, TaskStatus } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import type { OrderItem } from '@/utils/orderHelpers'

import { getTaskDetailPermissions } from './getTaskDetailPermissions'
import { mapTaskStatus } from './mapTaskStatus'
import type { TaskDetailRecord } from './taskDetailUtils'

const OWNER_ID = 'owner-1'
const WORKER_ID = 'worker-1'

// Quote eligibility requires COMPLETED worker onboarding (isWorkerSetupComplete
// checks worker.setupProgress.isComplete), not just a worker row.
const workerMe = () =>
  ({
    id: WORKER_ID,
    worker: { id: WORKER_ID, setupProgress: { isComplete: true } },
  }) as never

function baseTask(overrides: Partial<TaskDetailRecord> = {}): TaskDetailRecord {
  return {
    id: 'task-1',
    title: 'Test task',
    description: 'Desc',
    category: 'HANDYMAN',
    acceptedWorkerCap: 1,
    status: TaskStatus.Open,
    quotes: [],
    poster: { id: OWNER_ID, profile: { name: 'Alex' } },
    location: { name: 'London' },
    images: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as TaskDetailRecord
}

function baseOrder(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: 'order-1',
    taskId: 'task-1',
    quoteId: 'quote-1',
    customerUserId: OWNER_ID,
    workerUserId: WORKER_ID,
    status: OrderStatus.Active,
    agreedPrice: { amount: 80, currency: Currency.Gbp },
    snapshot: { title: 'Test task', description: 'Desc', category: 'HANDYMAN' },
    createdAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  } as OrderItem
}

describe('mapTaskStatus', () => {
  it('maps legacy statuses to canonical phases', () => {
    expect(mapTaskStatus('OPEN')).toBe('OPEN')
    expect(mapTaskStatus('QUOTE_ACCEPTED')).toBe('AWARDED')
    expect(mapTaskStatus('IN_PROGRESS')).toBe('AWARDED')
    expect(mapTaskStatus('CONFIRMED')).toBe('CLOSED')
    expect(mapTaskStatus('COMPLETED')).toBe('CLOSED')
  })
})

describe('getTaskDetailPermissions', () => {
  it('owner on OPEN task can manage quotes and cancel', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Open }),
      myOrder: null,
      me: { id: OWNER_ID, worker: null } as never,
      myQuote: null,
      isAuthenticated: true,
    })

    expect(permissions.isOwner).toBe(true)
    expect(permissions.isOpen).toBe(true)
    expect(permissions.showOwnerQuoteList).toBe(true)
    expect(permissions.showAcceptDecline).toBe(true)
    expect(permissions.canCancelTask).toBe(true)
    expect(permissions.canSubmitQuote).toBe(false)
  })

  it('worker with profile on OPEN task can submit quote', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Open }),
      myOrder: null,
      me: workerMe(),
      myQuote: null,
      isAuthenticated: true,
    })

    expect(permissions.canSubmitQuote).toBe(true)
    expect(permissions.showQuoteForm).toBe(true)
    expect(permissions.showFullAddress).toBe(false)
  })

  it('worker with pending quote shows quote form only when allowed', () => {
    const myQuote = {
      id: 'q1',
      taskId: 'task-1',
      workerUserId: WORKER_ID,
      status: QuoteStatus.Pending,
      createdAt: '2026-01-01T00:00:00.000Z',
    } as TaskDetailRecord['quotes'][number]

    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Open }),
      myOrder: null,
      me: workerMe(),
      myQuote,
      isAuthenticated: true,
    })

    expect(permissions.canSubmitQuote).toBe(true)
    expect(permissions.showQuoteForm).toBe(true)
  })

  it('order worker with ACTIVE order sees worker job tools', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.QuoteAccepted }),
      myOrder: baseOrder(),
      me: workerMe(),
      myQuote: null,
      isAuthenticated: true,
    })

    expect(permissions.isAwarded).toBe(true)
    expect(permissions.isOrderWorker).toBe(true)
    expect(permissions.isOrderActive).toBe(true)
    expect(permissions.showWorkerJobBanner).toBe(true)
    expect(permissions.showCompleteWithCode).toBe(true)
    expect(permissions.showFullAddress).toBe(true)
  })

  it('owner with ACTIVE order sees completion code', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.InProgress }),
      myOrder: baseOrder(),
      me: { id: OWNER_ID, worker: null } as never,
      myQuote: null,
      isAuthenticated: true,
    })

    expect(permissions.showCustomerCompletionCode).toBe(true)
    expect(permissions.showFullAddress).toBe(true)
  })

  it('CLOSED task disables open-phase actions', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Confirmed }),
      myOrder: baseOrder({ status: OrderStatus.Closed }),
      me: { id: OWNER_ID, worker: null } as never,
      myQuote: null,
      isAuthenticated: true,
    })

    expect(permissions.isClosed).toBe(true)
    expect(permissions.showAcceptDecline).toBe(false)
    expect(permissions.canCancelTask).toBe(false)
    expect(permissions.showCustomerCompletionCode).toBe(false)
  })

  it('respects atCap override for workers', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Open }),
      myOrder: null,
      me: workerMe(),
      myQuote: null,
      isAuthenticated: true,
      atCap: true,
    })

    expect(permissions.canSubmitQuote).toBe(false)
  })
})
