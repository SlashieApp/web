import { describe, expect, it } from 'vitest'

import { notificationHref, notificationToastPlan } from './notifications'

describe('notificationHref', () => {
  it('sends review prompts to the review page', () => {
    expect(
      notificationHref({
        type: 'REVIEW_PROMPT',
        taskId: 'task-1',
        orderId: 'order 1',
      }),
    ).toBe('/tasks/task-1/review?orderId=order%201')
    expect(notificationHref({ type: 'REVIEW_PROMPT', taskId: 'task-1' })).toBe(
      '/tasks/task-1/review',
    )
  })

  it('sends task-linked types to the task', () => {
    expect(
      notificationHref({
        type: 'QUOTE_RECEIVED',
        taskId: 'task-1',
        orderId: 'order-1',
      }),
    ).toBe('/tasks/task-1?orderId=order-1')
    expect(
      notificationHref({ type: 'ORDER_COMPLETED', taskId: 'task-1' }),
    ).toBe('/tasks/task-1')
  })

  it('falls back to the tasks list when there is no task', () => {
    expect(notificationHref({ type: 'ADMIN_MESSAGE', taskId: null })).toBe(
      '/tasks',
    )
    expect(notificationHref({ type: 'REVIEW_PROMPT', taskId: '  ' })).toBe(
      '/tasks',
    )
  })
})

describe('notificationToastPlan', () => {
  const unread = { id: 'a', readAt: null, isPopup: false }
  const popup = { id: 'b', readAt: null, isPopup: true }
  const read = { id: 'c', readAt: '2026-09-01T00:00:00.000Z', isPopup: false }

  it('toasts every unread non-popup on the first paint and skips popups', () => {
    const plan = notificationToastPlan({
      items: [unread, popup, read],
      bootstrapped: false,
      seenIds: new Set(),
    })
    expect(plan.toastIds).toEqual(['a'])
    expect([...plan.seenIds].sort()).toEqual(['a', 'b', 'c'])
  })

  it('toasts only newly arrived unread non-popups after bootstrap', () => {
    const plan = notificationToastPlan({
      items: [unread, popup, { id: 'd', readAt: null, isPopup: false }],
      bootstrapped: true,
      seenIds: new Set(['a', 'b', 'c']),
    })
    expect(plan.toastIds).toEqual(['d'])
    expect(plan.seenIds.has('b')).toBe(true)
  })
})
