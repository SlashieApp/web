import { OrderStatus } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import type { OrderItem } from './orderHelpers'
import { orderTimelineSteps } from './orderHelpers'

function order(status: OrderStatus | 'COMPLETED'): OrderItem {
  return {
    status,
    createdAt: '2026-06-01T09:00:00.000Z',
    closedAt: '2026-05-20T16:00:00.000Z',
    workCompletedAt: '2026-05-19T11:30:00.000Z',
    workerPaymentAcknowledgedAt: '2026-05-20T09:15:00.000Z',
  } as OrderItem
}

describe('orderTimelineSteps', () => {
  it('marks the agreement timeline finished when the order is COMPLETED', () => {
    const steps = orderTimelineSteps(order('COMPLETED'))
    const terminal = steps.find((step) => step.key === 'closed')
    expect(terminal).toMatchObject({
      label: 'Completed',
      done: true,
      current: true,
    })
    expect(steps.find((step) => step.key === 'work-completed')?.done).toBe(true)
    expect(steps.find((step) => step.key === 'payment')?.done).toBe(true)
  })

  it('does not mark a legacy CLOSED order as the completed terminal step', () => {
    const steps = orderTimelineSteps(order(OrderStatus.Closed))
    expect(steps.find((step) => step.key === 'closed')?.done).toBe(false)
  })
})
