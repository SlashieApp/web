import { describe, expect, it } from 'vitest'

import { canReviewCompletedOrder } from './reviewEligibility'

const order = {
  status: 'COMPLETED',
  customerUserId: 'customer-1',
  workerUserId: 'worker-1',
}

describe('canReviewCompletedOrder', () => {
  it('allows the customer and the worker on a COMPLETED order', () => {
    expect(
      canReviewCompletedOrder({
        userId: 'customer-1',
        posterId: 'someone-else',
        order,
        taskCancelled: false,
      }),
    ).toBe(true)
    expect(
      canReviewCompletedOrder({
        userId: 'worker-1',
        posterId: 'customer-1',
        order,
        taskCancelled: false,
      }),
    ).toBe(true)
  })

  it('allows the task poster when they are the customer of record', () => {
    expect(
      canReviewCompletedOrder({
        userId: 'customer-1',
        posterId: 'customer-1',
        order,
        taskCancelled: false,
      }),
    ).toBe(true)
  })

  it('rejects a non-party, a cancelled task, and a missing order', () => {
    expect(
      canReviewCompletedOrder({
        userId: 'stranger',
        posterId: 'customer-1',
        order,
        taskCancelled: false,
      }),
    ).toBe(false)
    expect(
      canReviewCompletedOrder({
        userId: 'customer-1',
        posterId: 'customer-1',
        order,
        taskCancelled: true,
      }),
    ).toBe(false)
    expect(
      canReviewCompletedOrder({
        userId: 'customer-1',
        posterId: 'customer-1',
        order: null,
        taskCancelled: false,
      }),
    ).toBe(false)
  })

  it('does not treat CLOSED or in-progress done statuses as reviewable', () => {
    expect(
      canReviewCompletedOrder({
        userId: 'customer-1',
        posterId: 'customer-1',
        order: { ...order, status: 'CLOSED' },
        taskCancelled: false,
      }),
    ).toBe(false)
    expect(
      canReviewCompletedOrder({
        userId: 'customer-1',
        posterId: 'customer-1',
        order: { ...order, status: 'WORK_COMPLETED' },
        taskCancelled: false,
      }),
    ).toBe(false)
    expect(
      canReviewCompletedOrder({
        userId: 'customer-1',
        posterId: 'customer-1',
        order: { ...order, status: 'PAYMENT_ACKNOWLEDGED' },
        taskCancelled: false,
      }),
    ).toBe(false)
  })
})
