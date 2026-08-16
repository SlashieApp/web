import { OrderStatus, QuoteStatus } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import { buildTaskActivityEvents } from './taskDetailActivity'
import {
  STORY_TASK_ID,
  storyTaskOrder,
  storyTaskQuote,
} from './taskDetailStoryFixtures'

describe('buildTaskActivityEvents', () => {
  it('returns an empty list when there are no quotes or orders', () => {
    expect(buildTaskActivityEvents({ quotes: [], orders: [] })).toEqual([])
  })

  it('emits quote created / accepted / declined / withdrawn events', () => {
    const events = buildTaskActivityEvents({
      quotes: [
        storyTaskQuote({
          id: 'q-pending',
          status: QuoteStatus.Pending,
          createdAt: '2026-06-01T10:00:00.000Z',
        }),
        storyTaskQuote({
          id: 'q-accepted',
          status: QuoteStatus.Accepted,
          createdAt: '2026-06-02T10:00:00.000Z',
          worker: {
            id: 'w2',
            profile: { name: 'Sam Taylor', avatarUrl: null },
            worker: { id: 'wp2', isVerified: false },
          },
        }),
        storyTaskQuote({
          id: 'q-declined',
          status: QuoteStatus.Declined,
          createdAt: '2026-06-03T10:00:00.000Z',
        }),
        storyTaskQuote({
          id: 'q-withdrawn',
          status: QuoteStatus.Withdrawn,
          createdAt: '2026-06-04T10:00:00.000Z',
        }),
      ],
      orders: [],
    })

    expect(events.map((e) => e.kind)).toEqual([
      'quoteWithdrawn',
      'quoteDeclined',
      'quoteAccepted',
      'quoteCreated',
    ])
    expect(events[2]?.actorName).toBe('Sam Taylor')
  })

  it('emits order lifecycle events from already-fetched timestamps', () => {
    const events = buildTaskActivityEvents({
      quotes: [],
      orders: [
        storyTaskOrder({
          id: 'ord-1',
          taskId: STORY_TASK_ID,
          status: OrderStatus.Closed,
          createdAt: '2026-06-01T09:00:00.000Z',
          workCompletedAt: '2026-06-02T09:00:00.000Z',
          workerPaymentAcknowledgedAt: '2026-06-02T10:00:00.000Z',
          closedAt: '2026-06-03T09:00:00.000Z',
        }),
      ],
    })

    expect(events.map((e) => e.kind)).toEqual([
      'orderClosed',
      'orderPaymentAcknowledged',
      'orderWorkCompleted',
      'orderCreated',
    ])
  })
})
