import { describe, expect, it } from 'vitest'

import { QuoteStatus, TaskStatus } from '@codegen/schema'

import type { TaskDetailRecord } from './taskDetailUtils'
import { taskOwnerAnalytics } from './taskOwnerAnalytics'

const task = {
  id: 'task-1',
  title: 'Mount a TV',
  status: TaskStatus.Open,
  views: 12,
  timeline: [],
  quotes: [
    {
      id: 'q1',
      status: QuoteStatus.Pending,
      createdAt: '2026-09-20T12:00:00.000Z',
    },
    {
      id: 'q2',
      status: QuoteStatus.Accepted,
      createdAt: '2026-09-20T14:00:00.000Z',
    },
  ],
} as unknown as TaskDetailRecord

describe('taskOwnerAnalytics', () => {
  it('summarises views, quotes, interest, and accepted count', () => {
    const stats = taskOwnerAnalytics(task)
    expect(stats.views).toBe(12)
    expect(stats.quoteCount).toBe(2)
    expect(stats.acceptedCount).toBe(1)
    expect(stats.interest).toBe('medium')
  })
})
