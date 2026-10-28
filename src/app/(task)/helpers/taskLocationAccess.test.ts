import { OrderStatus, QuoteStatus } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  type TaskLocationAccess,
  type TaskLocationAccessInput,
  taskLocationAccess,
  workerOrderStatus,
} from './taskLocationAccess'

const OWNER = 'owner-1'
const WORKER = 'worker-1'

/** A ready, signed-in worker with no quote and no order, on the owner's task. */
const worker: TaskLocationAccessInput = {
  guestView: false,
  viewerReady: true,
  meId: WORKER,
  posterId: OWNER,
}

type Row = [string, TaskLocationAccessInput, TaskLocationAccess]

/** The shared test table (FE-472 spec): the same rows in the web and the app. */
const TABLE: Row[] = [
  [
    '1. owner, any task status',
    { ...worker, meId: OWNER, myQuoteStatus: null },
    'exact',
  ],
  [
    '2. signed out',
    { guestView: true, viewerReady: true, meId: null, posterId: OWNER },
    'approximate',
  ],
  ['3. signed-in non-party', worker, 'approximate'],
  [
    '4. worker with a PENDING quote',
    { ...worker, myQuoteStatus: QuoteStatus.Pending },
    'approximate',
  ],
  [
    '5. worker with an ACCEPTED quote, no order yet',
    { ...worker, myQuoteStatus: QuoteStatus.Accepted },
    'exact',
  ],
  [
    '6a. booked worker, order ACTIVE',
    {
      ...worker,
      myQuoteStatus: QuoteStatus.Accepted,
      myOrderStatus: OrderStatus.Active,
    },
    'exact',
  ],
  [
    '6b. booked worker, order RESCHEDULING',
    { ...worker, myOrderStatus: OrderStatus.Rescheduling },
    'exact',
  ],
  [
    '6c. booked worker, order CANCEL_REQUESTED',
    { ...worker, myOrderStatus: OrderStatus.CancelRequested },
    'exact',
  ],
  [
    '6d. booked worker, order CONFLICT',
    { ...worker, myOrderStatus: OrderStatus.Conflict },
    'exact',
  ],
  [
    '7a. booked worker, order CANCELLED, quote still ACCEPTED',
    {
      ...worker,
      myQuoteStatus: QuoteStatus.Accepted,
      myOrderStatus: OrderStatus.Cancelled,
    },
    'exact',
  ],
  [
    '7b. booked worker, order COMPLETED, quote still ACCEPTED',
    {
      ...worker,
      myQuoteStatus: QuoteStatus.Accepted,
      myOrderStatus: OrderStatus.Completed,
    },
    'exact',
  ],
  [
    '8a. ex-booked worker after a reopen (quote CLOSED, old order CANCELLED)',
    {
      ...worker,
      myQuoteStatus: QuoteStatus.Closed,
      myOrderStatus: OrderStatus.Cancelled,
    },
    'approximate',
  ],
  [
    '8b. ex-booked worker, task re-awarded (old order COMPLETED)',
    {
      ...worker,
      myQuoteStatus: QuoteStatus.Closed,
      myOrderStatus: OrderStatus.Completed,
    },
    'approximate',
  ],
  [
    '9. owner preview (guestView), even for the owner',
    { ...worker, meId: OWNER, guestView: true },
    'approximate',
  ],
  [
    '10. signed in, role not loaded yet',
    { ...worker, meId: OWNER, viewerReady: false },
    'pending',
  ],
  [
    '11a. me null while an order is present, signed out',
    {
      guestView: true,
      viewerReady: true,
      meId: null,
      posterId: OWNER,
      myOrderStatus: OrderStatus.Active,
    },
    'approximate',
  ],
  [
    '11b. me null while an order is present, signed in and not ready',
    {
      guestView: false,
      viewerReady: false,
      meId: null,
      posterId: OWNER,
      myOrderStatus: OrderStatus.Active,
    },
    'pending',
  ],
]

describe('taskLocationAccess', () => {
  it.each(TABLE)('%s', (_name, input, expected) => {
    expect(taskLocationAccess(input)).toBe(expected)
  })

  it('treats a ready signed-in viewer with no me as approximate', () => {
    expect(
      taskLocationAccess({
        ...worker,
        meId: null,
        myOrderStatus: OrderStatus.Active,
      }),
    ).toBe('approximate')
  })
})

describe('workerOrderStatus', () => {
  const order = { workerUserId: WORKER, status: OrderStatus.Active }

  it("gives the status of the viewer's own order as its worker", () => {
    expect(workerOrderStatus(order, WORKER)).toBe('ACTIVE')
  })

  it('never counts an order that is not theirs, or a missing me', () => {
    expect(workerOrderStatus(order, 'someone-else')).toBeNull()
    expect(workerOrderStatus(order, null)).toBeNull()
    expect(workerOrderStatus(order, undefined)).toBeNull()
    expect(workerOrderStatus(null, WORKER)).toBeNull()
  })

  it("does not take the owner's side of an order for the worker's", () => {
    expect(
      workerOrderStatus(
        { workerUserId: WORKER, status: OrderStatus.Active },
        OWNER,
      ),
    ).toBeNull()
  })
})
