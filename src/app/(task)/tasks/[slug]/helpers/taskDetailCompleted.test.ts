import { describe, expect, it } from 'vitest'

import {
  isOrderCompletedStatus,
  isTaskDetailJobCompleted,
  taskDetailCompletedAt,
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

describe('taskDetailCompletedAt', () => {
  it('uses the order closedAt', () => {
    expect(
      taskDetailCompletedAt({
        taskStatus: 'AWARDED',
        order: { status: 'COMPLETED', closedAt: '2026-05-20T16:00:00.000Z' },
      }),
    ).toBe('2026-05-20T16:00:00.000Z')
    expect(
      taskDetailCompletedAt({
        taskStatus: 'AWARDED',
        order: { status: 'ACTIVE', closedAt: null },
      }),
    ).toBeNull()
  })
})
