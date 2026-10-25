import { QuoteStatus, TaskBookingStatus } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  type TaskDetailViewOrder,
  type TaskDetailViewTask,
  getTaskDetailView,
  liveQuoteCount,
} from './getTaskDetailView'
import { TASK_DETAIL_VIEWS } from './index'
import type { TaskDetailViewName } from './types'

const OWNER = { userId: 'owner', hasWorkerProfile: false }
const WORKER = { userId: 'worker', hasWorkerProfile: true }
const OTHER_WORKER = { userId: 'other', hasWorkerProfile: true }
const CUSTOMER = { userId: 'customer', hasWorkerProfile: false }
const NOW = new Date('2026-10-15T12:00:00Z')
const BEFORE = '2026-10-16T09:00:00Z'
const AFTER = '2026-10-15T09:00:00Z'

function task(
  status: string,
  quotes: TaskDetailViewTask['quotes'] = [],
  bookingStatus: string = TaskBookingStatus.None,
): TaskDetailViewTask {
  return { status, bookingStatus, posterId: 'owner', quotes }
}

function order(over: Partial<TaskDetailViewOrder> = {}): TaskDetailViewOrder {
  return {
    status: 'ACTIVE',
    workerUserId: 'worker',
    bookedStart: BEFORE,
    myCloseAction: null,
    counterpartyCloseAction: null,
    pendingRequest: null,
    ...over,
  }
}

const done = { kind: 'DONE' }
const failed = { kind: 'FAILED' }
const awarded = task(
  'AWARDED',
  [{ workerUserId: 'worker', status: 'ACCEPTED' }],
  TaskBookingStatus.Booked,
)
const seen = new Set<TaskDetailViewName>()

function expectView(
  name: TaskDetailViewName,
  ...args: Parameters<typeof getTaskDetailView>
) {
  seen.add(name)
  expect(getTaskDetailView(...args)).toBe(name)
}

describe('getTaskDetailView', () => {
  it('shows a skeleton until the task has loaded', () => {
    expectView('loading', null, null, OWNER, NOW)
  })

  describe('owner', () => {
    it("owner of an open task with no live quotes sees 'reaching workers'", () => {
      expectView(
        'owner.open.noQuotes',
        task('OPEN', [{ workerUserId: 'w1', status: QuoteStatus.Closed }]),
        null,
        OWNER,
        NOW,
      )
    })
    it('owner with a pending quote sees the compare-and-accept view', () => {
      expectView(
        'owner.open.quotes',
        task('OPEN', [{ workerUserId: 'w1', status: 'PENDING' }]),
        null,
        OWNER,
        NOW,
      )
    })
    it("owner sees 'Worker booked' before the start time", () => {
      expectView('owner.booked.beforeStart', awarded, order(), OWNER, NOW)
    })
    it('owner is asked to mark it Done once the start time passes', () => {
      expectView(
        'owner.booked.ready',
        awarded,
        order({ bookedStart: AFTER }),
        OWNER,
        NOW,
      )
    })
    it('owner who marked it Done waits for the worker', () => {
      expectView(
        'owner.booked.iMarkedDone',
        awarded,
        order({ bookedStart: AFTER, myCloseAction: done }),
        OWNER,
        NOW,
      )
    })
    it('owner sees that the worker marked it Done', () => {
      expectView(
        'owner.booked.theyMarkedDone',
        awarded,
        order({ bookedStart: AFTER, counterpartyCloseAction: done }),
        OWNER,
        NOW,
      )
    })
    it('owner who marked it Failed waits for the worker', () => {
      expectView(
        'owner.booked.iMarkedFailed',
        awarded,
        order({ bookedStart: AFTER, myCloseAction: failed }),
        OWNER,
        NOW,
      )
    })
    it('owner sees that the worker marked it Failed', () => {
      expectView(
        'owner.booked.theyMarkedFailed',
        awarded,
        order({ bookedStart: AFTER, counterpartyCloseAction: failed }),
        OWNER,
        NOW,
      )
    })
    it('owner who asked to reschedule waits for the worker', () => {
      expectView(
        'owner.booked.rescheduleByMe',
        awarded,
        order({
          status: 'RESCHEDULING',
          pendingRequest: { kind: 'RESCHEDULE', requestedByUserId: 'owner' },
        }),
        OWNER,
        NOW,
      )
    })
    it('owner is asked to answer a reschedule from the worker', () => {
      expectView(
        'owner.booked.rescheduleByThem',
        awarded,
        order({
          status: 'RESCHEDULING',
          pendingRequest: { kind: 'RESCHEDULE', requestedByUserId: 'worker' },
        }),
        OWNER,
        NOW,
      )
    })
    it('owner who asked to cancel waits for the worker', () => {
      expectView(
        'owner.booked.cancelByMe',
        awarded,
        order({
          status: 'CANCEL_REQUESTED',
          pendingRequest: { kind: 'CANCEL', requestedByUserId: 'owner' },
        }),
        OWNER,
        NOW,
      )
    })
    it('owner is asked to answer a cancel request made during a conflict', () => {
      expectView(
        'owner.booked.cancelByThem',
        awarded,
        order({
          status: 'CONFLICT',
          myCloseAction: done,
          counterpartyCloseAction: failed,
          pendingRequest: { kind: 'CANCEL', requestedByUserId: 'worker' },
        }),
        OWNER,
        NOW,
      )
    })
    it('owner who marked Done in a conflict is told what each side marked', () => {
      expectView(
        'owner.conflict.iMarkedDone',
        awarded,
        order({
          status: 'CONFLICT',
          myCloseAction: done,
          counterpartyCloseAction: failed,
        }),
        OWNER,
        NOW,
      )
    })
    it('owner who marked Failed in a conflict is told what each side marked', () => {
      expectView(
        'owner.conflict.iMarkedFailed',
        awarded,
        order({
          status: 'CONFLICT',
          myCloseAction: failed,
          counterpartyCloseAction: done,
        }),
        OWNER,
        NOW,
      )
    })
    it("owner of a completed booking sees 'Job complete'", () => {
      expectView(
        'owner.completed',
        awarded,
        order({ status: 'COMPLETED' }),
        OWNER,
        NOW,
      )
    })
    it("owner of a cancelled booking sees 'Booking cancelled', not 'Worker booked'", () => {
      expectView(
        'owner.bookingCancelled',
        awarded,
        order({ status: 'CANCELLED' }),
        OWNER,
        NOW,
      )
    })
    it("owner whose booking both sides marked Failed sees 'Booking didn't go ahead'", () => {
      expectView(
        'owner.bookingFailed',
        awarded,
        order({
          status: 'CANCELLED',
          myCloseAction: failed,
          counterpartyCloseAction: failed,
        }),
        OWNER,
        NOW,
      )
    })
    it('owner of a cancelled task is offered to post it again', () => {
      expectView('owner.cancelled', task('CANCELLED'), null, OWNER, NOW)
    })
  })

  describe('booked worker', () => {
    it("booked worker sees 'You are booked' before the start time", () => {
      expectView('worker.booked.beforeStart', awarded, order(), WORKER, NOW)
    })
    it('booked worker is asked to mark it Done once the start time passes', () => {
      expectView(
        'worker.booked.ready',
        awarded,
        order({ bookedStart: AFTER }),
        WORKER,
        NOW,
      )
    })
    it('booked worker who marked it Done waits for the owner', () => {
      expectView(
        'worker.booked.iMarkedDone',
        awarded,
        order({ bookedStart: AFTER, myCloseAction: done }),
        WORKER,
        NOW,
      )
    })
    it('booked worker sees that the owner marked it Done', () => {
      expectView(
        'worker.booked.theyMarkedDone',
        awarded,
        order({ bookedStart: AFTER, counterpartyCloseAction: done }),
        WORKER,
        NOW,
      )
    })
    it('booked worker who marked it Failed waits for the owner', () => {
      expectView(
        'worker.booked.iMarkedFailed',
        awarded,
        order({ bookedStart: AFTER, myCloseAction: failed }),
        WORKER,
        NOW,
      )
    })
    it('booked worker sees that the owner marked it Failed', () => {
      expectView(
        'worker.booked.theyMarkedFailed',
        awarded,
        order({ bookedStart: AFTER, counterpartyCloseAction: failed }),
        WORKER,
        NOW,
      )
    })
    it('booked worker who asked to reschedule waits for the owner', () => {
      expectView(
        'worker.booked.rescheduleByMe',
        awarded,
        order({
          status: 'RESCHEDULING',
          pendingRequest: { kind: 'RESCHEDULE', requestedByUserId: 'worker' },
        }),
        WORKER,
        NOW,
      )
    })
    it('booked worker is asked to answer a reschedule from the owner', () => {
      expectView(
        'worker.booked.rescheduleByThem',
        awarded,
        order({
          status: 'RESCHEDULING',
          pendingRequest: { kind: 'RESCHEDULE', requestedByUserId: 'owner' },
        }),
        WORKER,
        NOW,
      )
    })
    it('booked worker who asked to cancel waits for the owner', () => {
      expectView(
        'worker.booked.cancelByMe',
        awarded,
        order({
          status: 'CANCEL_REQUESTED',
          pendingRequest: { kind: 'CANCEL', requestedByUserId: 'worker' },
        }),
        WORKER,
        NOW,
      )
    })
    it('booked worker is asked to answer a cancel request from the owner', () => {
      expectView(
        'worker.booked.cancelByThem',
        awarded,
        order({
          status: 'CANCEL_REQUESTED',
          pendingRequest: { kind: 'CANCEL', requestedByUserId: 'owner' },
        }),
        WORKER,
        NOW,
      )
    })
    it('booked worker who marked Done in a conflict is told what each side marked', () => {
      expectView(
        'worker.conflict.iMarkedDone',
        awarded,
        order({
          status: 'CONFLICT',
          myCloseAction: done,
          counterpartyCloseAction: failed,
        }),
        WORKER,
        NOW,
      )
    })
    it('booked worker who marked Failed in a conflict is told what each side marked', () => {
      expectView(
        'worker.conflict.iMarkedFailed',
        awarded,
        order({
          status: 'CONFLICT',
          myCloseAction: failed,
          counterpartyCloseAction: done,
        }),
        WORKER,
        NOW,
      )
    })
    it("booked worker of a completed booking sees 'Job complete'", () => {
      expectView(
        'worker.completed',
        awarded,
        order({ status: 'COMPLETED' }),
        WORKER,
        NOW,
      )
    })
    it("booked worker of a cancelled booking sees 'Booking cancelled', not 'Worker booked'", () => {
      expectView(
        'worker.bookingCancelled',
        awarded,
        order({ status: 'CANCELLED' }),
        WORKER,
        NOW,
      )
    })
    it("booked worker whose booking both sides marked Failed sees 'Booking didn't go ahead'", () => {
      expectView(
        'worker.bookingFailed',
        awarded,
        order({
          status: 'CANCELLED',
          myCloseAction: failed,
          counterpartyCloseAction: failed,
        }),
        WORKER,
        NOW,
      )
    })
  })

  describe('everyone else', () => {
    it('worker who has not quoted (or withdrew) can send a quote', () => {
      expectView(
        'worker.open.notQuoted',
        task('OPEN', [{ workerUserId: 'w1', status: 'PENDING' }]),
        null,
        WORKER,
        NOW,
      )
    })
    it("worker with a pending quote sees 'Quote sent'", () => {
      expectView(
        'worker.open.quoted',
        task('OPEN', [{ workerUserId: 'worker', status: 'PENDING' }]),
        null,
        WORKER,
        NOW,
      )
    })
    it('worker whose quote was withdrawn, or has a status this build does not know, can quote again', () => {
      for (const status of [QuoteStatus.Withdrawn, 'A_STATUS_FOR_LATER']) {
        expectView(
          'worker.open.notQuoted',
          task('OPEN', [{ workerUserId: 'worker', status }]),
          null,
          WORKER,
          NOW,
        )
      }
    })
    // BE-113: the booked worker's quote closes when the booking ends early
    // and the owner reopens the task. It never comes back; a new one can.
    it("worker whose quote closed sees 'Quote closed' and can send a new one", () => {
      expectView(
        'worker.open.closed',
        task('OPEN', [{ workerUserId: 'worker', status: QuoteStatus.Closed }]),
        null,
        WORKER,
        NOW,
      )
      expect(TASK_DETAIL_VIEWS['worker.open.closed'].primaryAction).toBe(
        'sendQuote',
      )
    })
    // BE-113: the other quotes stay PENDING once someone is booked, and the
    // API sends a non-owner only their own on a task that isn't open.
    describe('a quote that stayed pending while someone else is booked', () => {
      const pending = [{ workerUserId: 'worker', status: QuoteStatus.Pending }]
      it("reads 'Booked by someone else' while the booking is on", () => {
        expectView(
          'worker.bookedByOther',
          task('AWARDED', pending, TaskBookingStatus.Booked),
          null,
          WORKER,
          NOW,
        )
      })
      it("reads 'Task completed' once that booking is complete", () => {
        expectView(
          'worker.completedByOther',
          task('AWARDED', pending, TaskBookingStatus.Completed),
          null,
          WORKER,
          NOW,
        )
      })
      it('reads the plain booked summary for a status it does not expect', () => {
        for (const bookingStatus of [
          TaskBookingStatus.None,
          'A_STATUS_FOR_LATER',
        ]) {
          expectView(
            'visitor.awarded',
            task('AWARDED', pending, bookingStatus),
            null,
            WORKER,
            NOW,
          )
        }
      })
    })
    it("worker whose quote is over sees the plain 'Worker booked' or 'Task completed'", () => {
      for (const status of [
        QuoteStatus.Closed,
        QuoteStatus.Withdrawn,
        'A_STATUS_FOR_LATER',
      ]) {
        const mine = [{ workerUserId: 'worker', status }]
        expectView(
          'visitor.awarded',
          task('AWARDED', mine, TaskBookingStatus.Booked),
          null,
          WORKER,
          NOW,
        )
        expectView(
          'visitor.completed',
          task('AWARDED', mine, TaskBookingStatus.Completed),
          null,
          WORKER,
          NOW,
        )
      }
    })
    it('signed-in customer without a worker profile is asked to become a worker', () => {
      expectView('customer.open', task('OPEN'), null, CUSTOMER, NOW)
    })
    it('guest is asked to sign in, not to become a worker', () => {
      expectView('guest.open', task('OPEN'), null, null, NOW)
    })
    it("anyone else on a booked task sees 'Worker booked'", () => {
      for (const viewer of [null, CUSTOMER, OTHER_WORKER]) {
        expectView('visitor.awarded', awarded, null, viewer, NOW)
      }
    })
    it("anyone else on a task whose job is complete sees 'Task completed'", () => {
      const completed = task('AWARDED', [], TaskBookingStatus.Completed)
      for (const viewer of [null, CUSTOMER, OTHER_WORKER]) {
        expectView('visitor.completed', completed, null, viewer, NOW)
      }
    })
    it("the owner with no order loaded reads the task's booking, never a worker's view", () => {
      expectView('visitor.awarded', awarded, null, OWNER, NOW)
      expectView(
        'visitor.completed',
        task('AWARDED', [], TaskBookingStatus.Completed),
        null,
        OWNER,
        NOW,
      )
    })
    it('anyone but the owner sees a cancelled task as cancelled', () => {
      expectView(
        'visitor.cancelled',
        task('CANCELLED', [{ workerUserId: 'worker', status: 'PENDING' }]),
        null,
        WORKER,
        NOW,
      )
    })
  })

  it('has a test for every view in the registry', () => {
    expect([...seen].sort()).toEqual(Object.keys(TASK_DETAIL_VIEWS).sort())
  })
})

describe('liveQuoteCount', () => {
  it('counts pending quotes only', () => {
    expect(
      liveQuoteCount([
        { status: QuoteStatus.Pending },
        { status: QuoteStatus.Closed },
        { status: QuoteStatus.Withdrawn },
        { status: QuoteStatus.Pending },
      ]),
    ).toBe(2)
  })
})
