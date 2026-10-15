import { describe, expect, it } from 'vitest'

import {
  isOrderCompletedStatus,
  isTaskDetailJobCompleted,
} from './taskDetailCompleted'

describe('isTaskDetailJobCompleted', () => {
  it('is completed only when the order is COMPLETED', () => {
    expect(
      isTaskDetailJobCompleted({
        taskStatus: 'AWARDED',
        orderStatus: 'COMPLETED',
      }),
    ).toBe(true)
    for (const orderStatus of [
      'ACTIVE',
      'RESCHEDULING',
      'CANCEL_REQUESTED',
      'CONFLICT',
      'CANCELLED',
      null,
    ]) {
      expect(
        isTaskDetailJobCompleted({ taskStatus: 'AWARDED', orderStatus }),
      ).toBe(false)
    }
    expect(isOrderCompletedStatus('CLOSED')).toBe(false)
  })

  it('keeps cancelled tasks on the cancelled chrome', () => {
    expect(
      isTaskDetailJobCompleted({
        taskStatus: 'CANCELLED',
        orderStatus: 'COMPLETED',
      }),
    ).toBe(false)
  })
})
