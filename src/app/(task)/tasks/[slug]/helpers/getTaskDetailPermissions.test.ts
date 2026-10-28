import {
  Currency,
  OrderPartyRole,
  OrderStatus,
  QuoteStatus,
  TaskStatus,
} from '@codegen/schema'
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
    status: TaskStatus.Open,
    quotes: [],
    poster: { id: OWNER_ID, profile: { name: 'Alex' } },
    location: { name: 'London' },
    images: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as TaskDetailRecord
}

/** A quote of `workerUserId`'s in any status. */
function quote(
  id: string,
  workerUserId: string,
  status: QuoteStatus,
): TaskDetailRecord['quotes'][number] {
  return {
    id,
    taskId: 'task-1',
    workerUserId,
    status,
  } as TaskDetailRecord['quotes'][number]
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
  it('maps API statuses to canonical phases', () => {
    expect(mapTaskStatus('DRAFT')).toBe('OPEN')
    expect(mapTaskStatus('OPEN')).toBe('OPEN')
    expect(mapTaskStatus('AWARDED')).toBe('AWARDED')
    expect(mapTaskStatus('CANCELLED')).toBe('CLOSED')
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
    expect(permissions.canAcceptQuote).toBe(true)
    expect(permissions.canCancelTask).toBe(true)
    expect(permissions.canSubmitQuote).toBe(false)
  })

  // BE-113: accepting one quote leaves the others PENDING, but only an open
  // task can accept one.
  it('owner of a booked task sees the quotes that stayed pending but cannot accept them', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({
        status: TaskStatus.Awarded,
        quotes: [
          quote('q2', WORKER_ID, QuoteStatus.Accepted),
          quote('q3', 'worker-3', QuoteStatus.Pending),
        ],
      }),
      myOrder: baseOrder(),
      me: { id: OWNER_ID, worker: null } as never,
      myQuote: null,
      isAuthenticated: true,
    })

    expect(permissions.showOwnerQuoteList).toBe(true)
    expect(permissions.canAcceptQuote).toBe(false)
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
  })

  it('worker with a pending quote can edit it', () => {
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
    expect(permissions.hasPendingQuote).toBe(true)
    expect(permissions.canWithdrawQuote).toBe(true)
  })

  // BE-113: when someone else is booked the quote stays PENDING. Editing it
  // needs an open task; withdrawing it doesn't.
  it('worker with a pending quote on a task that is no longer open can withdraw it, not edit it', () => {
    for (const status of [TaskStatus.Awarded, TaskStatus.Cancelled]) {
      const myQuote = quote('q1', WORKER_ID, QuoteStatus.Pending)
      const permissions = getTaskDetailPermissions({
        task: baseTask({ status, quotes: [myQuote] }),
        myOrder: null,
        me: workerMe(),
        myQuote,
        isAuthenticated: true,
      })
      expect(permissions.hasPendingQuote).toBe(false)
      expect(permissions.canSubmitQuote).toBe(false)
      expect(permissions.canWithdrawQuote).toBe(true)
    }
  })

  it('only the worker whose quote is still pending can withdraw it', () => {
    const pending = quote('q1', WORKER_ID, QuoteStatus.Pending)
    const owner = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Open, quotes: [pending] }),
      myOrder: null,
      me: { id: OWNER_ID, worker: null } as never,
      myQuote: null,
      isAuthenticated: true,
    })
    expect(owner.canWithdrawQuote).toBe(false)

    // Withdrawn, or closed once a booking ended and the task reopened.
    for (const status of [QuoteStatus.Withdrawn, QuoteStatus.Closed]) {
      const over = quote('q1', WORKER_ID, status)
      const worker = getTaskDetailPermissions({
        task: baseTask({ status: TaskStatus.Open, quotes: [over] }),
        myOrder: null,
        me: workerMe(),
        myQuote: over,
        isAuthenticated: true,
      })
      expect(worker.canWithdrawQuote).toBe(false)
    }
  })

  // FE-274: a quote that is over doesn't stop a new one while the task is open.
  it('worker whose quote was withdrawn or closed can quote again on an OPEN task', () => {
    for (const status of [QuoteStatus.Withdrawn, QuoteStatus.Closed]) {
      const myQuote = quote('q1', WORKER_ID, status)
      const permissions = getTaskDetailPermissions({
        task: baseTask({ status: TaskStatus.Open, quotes: [myQuote] }),
        myOrder: null,
        me: workerMe(),
        myQuote,
        isAuthenticated: true,
      })
      expect(permissions.canSubmitQuote).toBe(true)
      expect(permissions.hasPendingQuote).toBe(false)
    }
  })

  it('no one can quote once a quote is accepted', () => {
    const accepted = {
      id: 'q2',
      workerUserId: 'worker-2',
      status: QuoteStatus.Accepted,
    } as TaskDetailRecord['quotes'][number]
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Open, quotes: [accepted] }),
      myOrder: null,
      me: workerMe(),
      myQuote: null,
      isAuthenticated: true,
    })
    expect(permissions.canSubmitQuote).toBe(false)
  })

  it('a quote that did not win never makes the task full', () => {
    // Only ACCEPTED counts as accepted.
    for (const status of [
      QuoteStatus.Pending,
      QuoteStatus.Withdrawn,
      QuoteStatus.Closed,
    ]) {
      const permissions = getTaskDetailPermissions({
        task: baseTask({
          status: TaskStatus.Open,
          quotes: [quote('q2', 'worker-2', status)],
        }),
        myOrder: null,
        me: workerMe(),
        myQuote: null,
        isAuthenticated: true,
      })
      expect(permissions.atCap).toBe(false)
      expect(permissions.canSubmitQuote).toBe(true)
    }
  })

  it('order worker with ACTIVE order sees worker job tools', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Awarded }),
      myOrder: baseOrder(),
      me: workerMe(),
      myQuote: null,
      isAuthenticated: true,
    })

    expect(permissions.isAwarded).toBe(true)
    expect(permissions.isOrderWorker).toBe(true)
    expect(permissions.isOrderActive).toBe(true)
    expect(permissions.showOrderActions).toBe(true)
  })

  it('keeps booking tools for reschedule, cancel requests, and CONFLICT', () => {
    for (const status of [
      OrderStatus.Rescheduling,
      OrderStatus.CancelRequested,
      OrderStatus.Conflict,
    ]) {
      const permissions = getTaskDetailPermissions({
        task: baseTask({ status: TaskStatus.Awarded }),
        myOrder: baseOrder({ status }),
        me: workerMe(),
        myQuote: null,
        isAuthenticated: true,
      })
      expect(permissions.showOrderActions).toBe(true)
      expect(permissions.isOrderConflict).toBe(status === OrderStatus.Conflict)
    }
  })

  it('owner with ACTIVE order sees the booking', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Awarded }),
      myOrder: baseOrder(),
      me: { id: OWNER_ID, worker: null } as never,
      myQuote: null,
      isAuthenticated: true,
    })

    expect(permissions.showOrderActions).toBe(true)
    expect(permissions.canRepostTask).toBe(false)
  })

  it('finished job disables open-phase actions', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Awarded }),
      myOrder: baseOrder({ status: OrderStatus.Completed }),
      me: { id: OWNER_ID, worker: null } as never,
      myQuote: null,
      isAuthenticated: true,
    })

    expect(permissions.isJobCompleted).toBe(true)
    expect(permissions.canAcceptQuote).toBe(false)
    expect(permissions.canCancelTask).toBe(false)
    expect(permissions.showOrderActions).toBe(false)
    expect(permissions.canRepostTask).toBe(true)
  })

  it('owner can repost after a cancelled booking', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Awarded }),
      myOrder: baseOrder({ status: OrderStatus.Cancelled }),
      me: { id: OWNER_ID, worker: null } as never,
      myQuote: null,
      isAuthenticated: true,
    })

    expect(permissions.showOrderActions).toBe(false)
    expect(permissions.canRepostTask).toBe(true)
  })

  it('COMPLETED order shows completed chrome and hides booking tools', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Awarded }),
      myOrder: baseOrder({
        status: 'COMPLETED' as OrderStatus,
        closedAt: '2026-05-20T16:00:00.000Z',
      }),
      me: workerMe(),
      myQuote: null,
      isAuthenticated: true,
    })

    expect(permissions.isJobCompleted).toBe(true)
    expect(permissions.isAwarded).toBe(true)
    expect(permissions.showOrderActions).toBe(false)
    expect(permissions.canRepostTask).toBe(false)
  })

  it('does not treat a legacy CLOSED order as completed', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Awarded }),
      myOrder: baseOrder({ status: 'CLOSED' as OrderStatus }),
      me: workerMe(),
      myQuote: null,
      isAuthenticated: true,
    })

    expect(permissions.isJobCompleted).toBe(false)
  })

  it('cancelled tasks keep cancelled chrome', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Cancelled }),
      myOrder: null,
      me: { id: OWNER_ID, worker: null } as never,
      myQuote: null,
      isAuthenticated: true,
    })

    expect(permissions.isCancelled).toBe(true)
    expect(permissions.isJobCompleted).toBe(false)
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

  it("visitor on an OPEN task can't quote or see the address", () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Open }),
      myOrder: null,
      me: null,
      myQuote: null,
      isAuthenticated: false,
    })

    expect(permissions.canSubmitQuote).toBe(false)
  })
})

describe('getTaskDetailPermissions while suspended (BE-108)', () => {
  const BY_SLASHIE = { bySlashie: true, posterSuspended: false }
  const pendingQuote = {
    id: 'q1',
    taskId: 'task-1',
    workerUserId: WORKER_ID,
    status: QuoteStatus.Pending,
  } as TaskDetailRecord['quotes'][number]

  it('owner of a suspended open task: no accept, edit or cancel', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Open, suspension: BY_SLASHIE }),
      myOrder: null,
      me: { id: OWNER_ID, worker: null } as never,
      myQuote: null,
      isAuthenticated: true,
    })
    expect(permissions).toMatchObject({
      isSuspended: true,
      isFrozen: true,
      canReopen: false,
      canAcceptQuote: false,
      canCancelTask: false,
      canEditTask: false,
    })
  })

  it('a suspended task can still be posted again (a new task)', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Cancelled, suspension: BY_SLASHIE }),
      myOrder: null,
      me: { id: OWNER_ID, worker: null } as never,
      myQuote: null,
      isAuthenticated: true,
    })
    expect(permissions.canRepostTask).toBe(true)
    expect(permissions.canReopen).toBe(false)
  })

  it('worker with a pending quote on a suspended task can no longer edit it', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({
        status: TaskStatus.Open,
        quotes: [pendingQuote],
        suspension: { bySlashie: false, posterSuspended: true },
      }),
      myOrder: null,
      me: workerMe(),
      myQuote: pendingQuote,
      isAuthenticated: true,
    })
    expect(permissions).toMatchObject({
      hasPendingQuote: true,
      canSubmitQuote: false,
      canWithdrawQuote: false,
      isFrozen: true,
    })
  })

  it('a booking whose other party is suspended is frozen for both sides', () => {
    for (const [me, role] of [
      [{ id: OWNER_ID, worker: null } as never, OrderPartyRole.Worker],
      [workerMe(), OrderPartyRole.Customer],
    ] as const) {
      const permissions = getTaskDetailPermissions({
        // The API offers the reopen to the customer of a suspended worker.
        task: baseTask({
          status: TaskStatus.Awarded,
          canReopen: role === OrderPartyRole.Worker,
        }),
        myOrder: baseOrder({
          counterpartySuspension: {
            role,
            name: 'Someone',
            canReopen: role === OrderPartyRole.Worker,
          },
        }),
        me,
        myQuote: null,
        isAuthenticated: true,
      })
      expect(permissions.isSuspended).toBe(false)
      expect(permissions.isFrozen).toBe(true)
      expect(permissions.showOrderActions).toBe(false)
      expect(permissions.canReopen).toBe(role === OrderPartyRole.Worker)
    }
  })

  it('nothing is frozen without a suspension', () => {
    const permissions = getTaskDetailPermissions({
      task: baseTask({ status: TaskStatus.Awarded, suspension: null }),
      myOrder: baseOrder({ counterpartySuspension: null }),
      me: { id: OWNER_ID, worker: null } as never,
      myQuote: null,
      isAuthenticated: true,
    })
    expect(permissions).toMatchObject({
      isSuspended: false,
      isFrozen: false,
      canReopen: false,
      showOrderActions: true,
    })
  })
})

// BE-113: the API says when `reopenTask` would work (`Task.canReopen`), for a
// cancelled task, a booking that was cancelled (the task stays AWARDED) or a
// booking whose worker is suspended. The client keeps no rules of its own.
describe('getTaskDetailPermissions: canReopen (BE-113)', () => {
  const owner = { id: OWNER_ID, worker: null } as never

  const reopen = (
    task: Partial<TaskDetailRecord>,
    me: unknown = owner,
    myOrder: OrderItem | null = null,
  ) =>
    getTaskDetailPermissions({
      task: baseTask(task),
      myOrder,
      me: me as never,
      myQuote: null,
      isAuthenticated: true,
    }).canReopen

  it('follows the API for the owner, whatever the task looks like', () => {
    expect(reopen({ status: TaskStatus.Cancelled, canReopen: true })).toBe(true)
    expect(reopen({ status: TaskStatus.Cancelled, canReopen: false })).toBe(
      false,
    )
  })

  it('offers it on a booked task whose booking was cancelled', () => {
    const cancelled = baseOrder({ status: OrderStatus.Cancelled })
    expect(
      reopen({ status: TaskStatus.Awarded, canReopen: true }, owner, cancelled),
    ).toBe(true)
    // A completed booking can't be reopened: the API says no.
    expect(
      reopen(
        { status: TaskStatus.Awarded, canReopen: false },
        owner,
        baseOrder({ status: OrderStatus.Completed }),
      ),
    ).toBe(false)
  })

  it('is never offered to anyone but the owner', () => {
    expect(
      reopen({ status: TaskStatus.Cancelled, canReopen: true }, workerMe()),
    ).toBe(false)
    expect(
      reopen({ status: TaskStatus.Cancelled, canReopen: true }, null),
    ).toBe(false)
  })

  it('is off until the API has answered', () => {
    expect(reopen({ status: TaskStatus.Cancelled })).toBe(false)
  })
})
