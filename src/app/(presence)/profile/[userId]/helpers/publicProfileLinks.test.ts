import { describe, expect, it } from 'vitest'

import {
  contactHref,
  resolveReviewHref,
  reviewFormPath,
} from './publicProfileLinks'

describe('resolveReviewHref', () => {
  const viewer = {
    canLeaveReview: true,
    reviewTaskId: 'task 1',
    reviewOrderId: 'order-1',
  }

  it("links the API's newest unreviewed job together", () => {
    expect(resolveReviewHref(viewer)).toBe(reviewFormPath('task 1', 'order-1'))
    expect(resolveReviewHref(viewer)).toBe(
      '/tasks/task 1/review?orderId=order-1',
    )
  })

  it('has no link without both ids', () => {
    expect(resolveReviewHref({ ...viewer, reviewOrderId: null })).toBeNull()
    expect(resolveReviewHref({ ...viewer, reviewTaskId: ' ' })).toBeNull()
  })

  it('stays closed when the viewer cannot review or is signed out', () => {
    expect(resolveReviewHref({ ...viewer, canLeaveReview: false })).toBeNull()
    expect(resolveReviewHref(null)).toBeNull()
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
