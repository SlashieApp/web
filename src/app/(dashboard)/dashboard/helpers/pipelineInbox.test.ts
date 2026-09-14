import { OrderStatus } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  storyOrder,
  storyQuote,
  storyTask,
} from '@/app/(dashboard)/quotes/components/workerQuoteStoryFixtures'
import type { MyQuoteItem } from '@/utils/dashboardHelpers'

import {
  TASK_OWNER_QUOTES_HREF,
  buildPostedByMeRows,
  buildWorkImOnRows,
  countNeedsAttention,
} from './pipelineInbox'

const CUSTOMER_ID = 'customer-story-1'
const WORKER_ID = 'worker-story-1'

function quoteItem(
  taskId: string,
  title: string,
  quoteStatus: string,
  quoteId = `quote-${taskId}`,
): MyQuoteItem {
  const quote = storyQuote({
    id: quoteId,
    taskId,
    workerUserId: WORKER_ID,
    status: quoteStatus,
  })
  return {
    task: storyTask({
      id: taskId,
      title,
      quotes: [quote],
    }),
    quote,
  }
}

describe('buildPostedByMeRows', () => {
  it('uses Accept when a posted task has one pending quote', () => {
    const quote = storyQuote({ id: 'q1', taskId: 't1', status: 'PENDING' })
    const rows = buildPostedByMeRows(
      [storyTask({ id: 't1', title: 'Fix tap', quotes: [quote] })],
      [],
      CUSTOMER_ID,
    )

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      actionKind: 'accept',
      actionHref: TASK_OWNER_QUOTES_HREF('t1'),
      needsAttention: true,
      statusLabel: 'Collecting quotes',
    })
  })

  it('uses Respond when a posted task has several pending quotes', () => {
    const quotes = [
      storyQuote({ id: 'q1', taskId: 't2', status: 'PENDING' }),
      storyQuote({ id: 'q2', taskId: 't2', status: 'PENDING' }),
    ]
    const rows = buildPostedByMeRows(
      [storyTask({ id: 't2', title: 'Paint wall', quotes })],
      [],
      CUSTOMER_ID,
    )

    expect(rows[0]?.actionKind).toBe('respond')
    expect(rows[0]?.needsAttention).toBe(true)
  })

  it('keeps waiting posted tasks without a next-action CTA', () => {
    const rows = buildPostedByMeRows(
      [storyTask({ id: 't3', title: 'Assemble desk', quotes: [] })],
      [],
      CUSTOMER_ID,
    )

    expect(rows[0]).toMatchObject({
      actionKind: 'view',
      actionHref: '/tasks/t3',
      needsAttention: false,
      statusLabel: 'Waiting for quotes',
    })
  })

  it('asks the customer to contact offline on an active booking', () => {
    const rows = buildPostedByMeRows(
      [storyTask({ id: 't4', title: 'Mount TV', status: 'AWARDED' })],
      [
        storyOrder({
          id: 'o4',
          taskId: 't4',
          customerUserId: CUSTOMER_ID,
          status: OrderStatus.Active,
        }),
      ],
      CUSTOMER_ID,
    )

    expect(rows[0]).toMatchObject({
      actionKind: 'contactOffline',
      actionHref: '/tasks/t4#task-order',
      needsAttention: true,
      statusLabel: 'In progress',
    })
  })

  it('asks the customer to mark done after the worker completes', () => {
    const rows = buildPostedByMeRows(
      [storyTask({ id: 't5', title: 'Garden tidy' })],
      [
        storyOrder({
          id: 'o5',
          taskId: 't5',
          customerUserId: CUSTOMER_ID,
          status: OrderStatus.WorkCompleted,
        }),
      ],
      CUSTOMER_ID,
    )

    expect(rows[0]).toMatchObject({
      actionKind: 'markDone',
      needsAttention: true,
      statusLabel: 'Awaiting your confirm',
    })
  })

  it('omits completed and cancelled posted tasks', () => {
    const rows = buildPostedByMeRows(
      [
        storyTask({ id: 'done', title: 'Old job', status: 'COMPLETED' }),
        storyTask({ id: 'cancel', title: 'Cancelled', status: 'CANCELLED' }),
      ],
      [
        storyOrder({
          id: 'closed',
          taskId: 'done',
          customerUserId: CUSTOMER_ID,
          status: OrderStatus.Closed,
        }),
      ],
      CUSTOMER_ID,
    )

    expect(rows).toEqual([])
  })

  it('sorts rows that need attention first', () => {
    const pending = storyQuote({
      id: 'qp',
      taskId: 'urgent',
      status: 'PENDING',
    })
    const rows = buildPostedByMeRows(
      [
        storyTask({
          id: 'waiting',
          title: 'Waiting task',
          quotes: [],
          createdAt: '2026-06-02T10:00:00.000Z',
        }),
        storyTask({
          id: 'urgent',
          title: 'Urgent task',
          quotes: [pending],
          createdAt: '2026-06-01T10:00:00.000Z',
        }),
      ],
      [],
      CUSTOMER_ID,
    )

    expect(rows.map((row) => row.id)).toEqual([
      'posted-urgent',
      'posted-waiting',
    ])
  })
})

describe('buildWorkImOnRows', () => {
  it('shows pending quotes as waiting, without a forced action', () => {
    const rows = buildWorkImOnRows(
      [quoteItem('tw1', 'Garden tidy-up', 'PENDING')],
      [],
      WORKER_ID,
    )

    expect(rows[0]).toMatchObject({
      actionKind: 'view',
      needsAttention: false,
      statusLabel: 'Quote sent',
    })
  })

  it('asks the worker to mark done on an active job', () => {
    const item = quoteItem('tw2', 'IKEA desk', 'ACCEPTED')
    const rows = buildWorkImOnRows(
      [item],
      [
        storyOrder({
          id: 'ow2',
          taskId: 'tw2',
          quoteId: item.quote.id,
          workerUserId: WORKER_ID,
          status: OrderStatus.Active,
        }),
      ],
      WORKER_ID,
    )

    expect(rows[0]).toMatchObject({
      actionKind: 'markDone',
      actionHref: '/tasks/tw2#task-order',
      needsAttention: true,
      statusLabel: 'Booked',
    })
  })

  it('asks the worker to contact offline after work is completed', () => {
    const item = quoteItem('tw3', 'Paint hallway', 'ACCEPTED')
    const rows = buildWorkImOnRows(
      [item],
      [
        storyOrder({
          id: 'ow3',
          taskId: 'tw3',
          quoteId: item.quote.id,
          workerUserId: WORKER_ID,
          status: OrderStatus.WorkCompleted,
        }),
      ],
      WORKER_ID,
    )

    expect(rows[0]).toMatchObject({
      actionKind: 'contactOffline',
      statusLabel: 'Done',
      needsAttention: true,
    })
  })

  it('includes a worker order that has no matching quote row', () => {
    const rows = buildWorkImOnRows(
      [],
      [
        storyOrder({
          id: 'orphan',
          taskId: 'orphan-task',
          workerUserId: WORKER_ID,
          status: OrderStatus.Active,
          snapshot: {
            ...storyOrder().snapshot,
            title: 'Orphan booked job',
          },
        }),
      ],
      WORKER_ID,
    )

    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      title: 'Orphan booked job',
      actionKind: 'markDone',
      needsAttention: true,
    })
  })

  it('omits declined and closed worker items', () => {
    const rows = buildWorkImOnRows(
      [quoteItem('ended', 'Move sofa', 'DECLINED')],
      [
        storyOrder({
          id: 'closed',
          taskId: 'closed-task',
          workerUserId: WORKER_ID,
          status: OrderStatus.Closed,
        }),
      ],
      WORKER_ID,
    )

    expect(rows).toEqual([])
  })
})

describe('countNeedsAttention', () => {
  it('counts only rows that need a next action', () => {
    const pending = storyQuote({ id: 'q', taskId: 't', status: 'PENDING' })
    const posted = buildPostedByMeRows(
      [
        storyTask({ id: 't', quotes: [pending] }),
        storyTask({ id: 'idle', quotes: [] }),
      ],
      [],
      CUSTOMER_ID,
    )

    expect(countNeedsAttention(posted)).toBe(1)
  })
})
