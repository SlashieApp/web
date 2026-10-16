import { describe, expect, it } from 'vitest'

import {
  contactHref,
  pickReviewTarget,
  resolveReviewHref,
  reviewFormPath,
} from './publicProfileLinks'

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

  it('has no link until a finished order with this worker is loaded', () => {
    expect(
      resolveReviewHref({
        canLeaveReview: true,
        profileUserId: 'user-1',
        orders: [],
      }),
    ).toBeNull()
  })

  it('stays closed when the viewer cannot review', () => {
    expect(
      resolveReviewHref({
        canLeaveReview: false,
        profileUserId: 'user-1',
        orders: [
          {
            id: 'order-1',
            taskId: 'task-1',
            workerUserId: 'user-1',
          },
        ],
      }),
    ).toBeNull()
  })
})

describe('contactHref', () => {
  const target = { profileUserId: 'user-1', excludeTaskId: null }

  it('sends a signed-out visitor to sign in and back to this profile', () => {
    expect(
      contactHref('signIn', {
        ...target,
        excludeTaskId: 'task-9',
        relatedTaskId: null,
      }),
    ).toBe(
      `/login?next=${encodeURIComponent('/profile/user-1?excludeTaskId=task-9')}`,
    )
  })

  it('sends a visitor with no quote or job to post a task', () => {
    expect(contactHref('postTask', { ...target, relatedTaskId: null })).toBe(
      '/tasks/create',
    )
  })

  it("opens the quotes on the customer's task", () => {
    expect(
      contactHref('viewQuote', { ...target, relatedTaskId: 'task-1' }),
    ).toBe('/tasks/task-1#task-quotes')
  })

  it('opens the booked job', () => {
    expect(contactHref('openJob', { ...target, relatedTaskId: 'task-2' })).toBe(
      '/tasks/task-2',
    )
  })
})
