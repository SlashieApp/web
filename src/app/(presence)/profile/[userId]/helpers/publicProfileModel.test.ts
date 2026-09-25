import { describe, expect, it } from 'vitest'

import {
  type PublicWorkHistoryItem,
  activityRangeBounds,
  filterWorkHistory,
  pickReviewTarget,
  resolveReviewHref,
  reviewFormPath,
} from './publicProfileModel'
import { PublicProfileWorkRole } from './publicProfileTypes'

describe('pickReviewTarget', () => {
  const orders = [
    {
      id: 'order-old',
      taskId: 'task-old',
      workerUserId: 'user-1',
      closedAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2025-12-01T00:00:00.000Z',
    },
    {
      id: 'order-new',
      taskId: 'task-new',
      workerUserId: 'user-1',
      closedAt: '2026-06-01T00:00:00.000Z',
      createdAt: '2026-05-01T00:00:00.000Z',
    },
    {
      id: 'order-other',
      taskId: 'task-other',
      workerUserId: 'user-2',
      closedAt: '2026-08-01T00:00:00.000Z',
      createdAt: '2026-08-01T00:00:00.000Z',
    },
  ]

  it('picks the most recently closed completed order with this worker', () => {
    expect(pickReviewTarget('user-1', orders)).toEqual({
      taskId: 'task-new',
      orderId: 'order-new',
    })
  })

  it('breaks closedAt ties with createdAt', () => {
    expect(
      pickReviewTarget('user-1', [
        {
          id: 'a',
          taskId: 'task-a',
          workerUserId: 'user-1',
          closedAt: '2026-06-01T00:00:00.000Z',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'b',
          taskId: 'task-b',
          workerUserId: 'user-1',
          closedAt: '2026-06-01T00:00:00.000Z',
          createdAt: '2026-05-01T00:00:00.000Z',
        },
      ]),
    ).toEqual({ taskId: 'task-b', orderId: 'b' })
  })
})

describe('resolveReviewHref', () => {
  it('links the newest eligible order', () => {
    expect(
      resolveReviewHref({
        canLeaveReview: true,
        profileUserId: 'user-1',
        orders: [
          {
            id: 'order-1',
            taskId: 'task 1',
            workerUserId: 'user-1',
            closedAt: '2026-04-01T00:00:00.000Z',
          },
        ],
      }),
    ).toBe(reviewFormPath('task 1', 'order-1'))
  })

  it('falls back to the related task when no order row is loaded', () => {
    expect(
      resolveReviewHref({
        canLeaveReview: true,
        profileUserId: 'user-1',
        relatedTaskId: 'task-9',
        orders: [],
      }),
    ).toBe('/tasks/task-9/review')
  })

  it('stays closed when the viewer cannot review', () => {
    expect(
      resolveReviewHref({
        canLeaveReview: false,
        profileUserId: 'user-1',
        relatedTaskId: 'task-9',
        orders: [],
      }),
    ).toBeNull()
  })
})

describe('filterWorkHistory', () => {
  const items: PublicWorkHistoryItem[] = [
    {
      orderId: 'o1',
      taskId: 't1',
      role: PublicProfileWorkRole.Worker,
      title: 'Fix a tap',
      category: 'HANDYMAN',
      categoryLabel: 'Handyman',
      areaLabel: 'Camden',
      completedAt: '2026-09-10T12:00:00.000Z',
    },
    {
      orderId: 'o2',
      taskId: 't2',
      role: PublicProfileWorkRole.Customer,
      title: 'Move a sofa',
      category: 'MOVING',
      categoryLabel: 'Moving',
      areaLabel: 'Islington',
      completedAt: '2026-08-02T12:00:00.000Z',
    },
  ]
  const now = new Date(2026, 8, 20)

  it('keeps this month and matches search without amounts', () => {
    expect(activityRangeBounds('month', now).start.getMonth()).toBe(8)
    const matched = filterWorkHistory(items, 'month', now, 'tap')
    expect(matched.map((item) => item.orderId)).toEqual(['o1'])
    expect(matched[0]).not.toHaveProperty('amount')
  })

  it('uses last month for the previous calendar month', () => {
    expect(
      filterWorkHistory(items, 'lastMonth', now, '').map(
        (item) => item.orderId,
      ),
    ).toEqual(['o2'])
  })
})
