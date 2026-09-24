import { TaskTimelineEventType } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  formatTaskDetailCompletedDate,
  isOrderCompletedStatus,
  isTaskDetailJobCompleted,
  taskDetailCompletedAt,
} from './taskDetailCompleted'

describe('isTaskDetailJobCompleted', () => {
  it('treats an order status of COMPLETED as completed', () => {
    expect(
      isTaskDetailJobCompleted({
        taskStatus: 'IN_PROGRESS',
        orderStatus: 'COMPLETED',
      }),
    ).toBe(true)
    expect(isOrderCompletedStatus('COMPLETED')).toBe(true)
  })

  it('does not treat legacy CLOSED as a second completed status', () => {
    expect(
      isTaskDetailJobCompleted({
        taskStatus: 'IN_PROGRESS',
        orderStatus: 'CLOSED',
      }),
    ).toBe(false)
    expect(isOrderCompletedStatus('CLOSED')).toBe(false)
  })

  it('uses the hub terminal task statuses when the job is finished', () => {
    expect(
      isTaskDetailJobCompleted({
        taskStatus: 'COMPLETED',
        orderStatus: null,
      }),
    ).toBe(true)
    expect(
      isTaskDetailJobCompleted({
        taskStatus: 'CONFIRMED',
        orderStatus: 'ACTIVE',
      }),
    ).toBe(true)
  })

  it('keeps cancelled tasks off the completed badge', () => {
    expect(
      isTaskDetailJobCompleted({
        taskStatus: 'CANCELLED',
        orderStatus: null,
      }),
    ).toBe(false)
  })

  it('agrees with the hub done-order set for in-flight completion', () => {
    expect(
      isTaskDetailJobCompleted({
        taskStatus: 'IN_PROGRESS',
        orderStatus: 'WORK_COMPLETED',
      }),
    ).toBe(true)
    expect(
      isTaskDetailJobCompleted({
        taskStatus: 'QUOTE_ACCEPTED',
        orderStatus: 'PAYMENT_ACKNOWLEDGED',
      }),
    ).toBe(true)
  })

  it('leaves an active booking on the in-progress chrome', () => {
    expect(
      isTaskDetailJobCompleted({
        taskStatus: 'IN_PROGRESS',
        orderStatus: 'ACTIVE',
      }),
    ).toBe(false)
    expect(
      isTaskDetailJobCompleted({ taskStatus: 'OPEN', orderStatus: null }),
    ).toBe(false)
  })
})

describe('taskDetailCompletedAt', () => {
  it('reads the date from order.closedAt only when the order is COMPLETED', () => {
    expect(
      taskDetailCompletedAt({
        taskStatus: 'IN_PROGRESS',
        order: {
          status: 'COMPLETED',
          closedAt: '2026-05-20T16:00:00.000Z',
          workCompletedAt: '2026-05-19T11:30:00.000Z',
        },
      }),
    ).toBe('2026-05-20T16:00:00.000Z')
  })

  it('shows the badge without a date when closedAt is missing', () => {
    expect(
      taskDetailCompletedAt({
        taskStatus: 'IN_PROGRESS',
        order: { status: 'COMPLETED', closedAt: null },
      }),
    ).toBeNull()
  })

  it('falls back to the task completion timeline when there is no order', () => {
    expect(
      taskDetailCompletedAt({
        taskStatus: 'COMPLETED',
        order: null,
        timeline: [
          {
            type: TaskTimelineEventType.TaskConfirmed,
            timestamp: '2026-05-18T10:00:00.000Z',
          },
          {
            type: TaskTimelineEventType.TaskCompleted,
            timestamp: '2026-05-17T10:00:00.000Z',
          },
        ],
      }),
    ).toBe('2026-05-17T10:00:00.000Z')
  })

  it('uses the confirmation timeline when the task was confirmed and has no order', () => {
    expect(
      taskDetailCompletedAt({
        taskStatus: 'CONFIRMED',
        order: null,
        timeline: [
          {
            type: TaskTimelineEventType.TaskConfirmed,
            timestamp: '2026-05-18T10:00:00.000Z',
          },
        ],
      }),
    ).toBe('2026-05-18T10:00:00.000Z')
  })
})

describe('formatTaskDetailCompletedDate', () => {
  it('formats a medium date for the active locale', () => {
    const day = new Date(2026, 4, 20, 12, 0, 0)
    expect(formatTaskDetailCompletedDate(day, 'en')).toBe(
      new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(day),
    )
    expect(formatTaskDetailCompletedDate('not-a-date', 'en')).toBeNull()
  })
})
