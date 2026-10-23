import { OrderStatus } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import { currentTaskOrder } from './orderHelpers'

function order(id: string, status: OrderStatus, createdAt: string) {
  return { id, status, createdAt }
}

const OLD_CANCELLED = order(
  'old',
  OrderStatus.Cancelled,
  '2026-10-01T09:00:00.000Z',
)

describe('currentTaskOrder', () => {
  it('has none without orders', () => {
    expect(currentTaskOrder([], 'AWARDED')).toBeNull()
  })

  it('takes the live booking over an older cancelled one, in any order', () => {
    const live = order('new', OrderStatus.Active, '2026-10-20T09:00:00.000Z')
    expect(currentTaskOrder([live, OLD_CANCELLED], 'AWARDED')).toBe(live)
    expect(currentTaskOrder([OLD_CANCELLED, live], 'AWARDED')).toBe(live)
  })

  it('counts a booking waiting on a request, or in CONFLICT, as live', () => {
    for (const status of [
      OrderStatus.Rescheduling,
      OrderStatus.CancelRequested,
      OrderStatus.Conflict,
    ]) {
      const live = order('live', status, '2026-09-01T09:00:00.000Z')
      expect(currentTaskOrder([OLD_CANCELLED, live], 'AWARDED')).toBe(live)
    }
  })

  it('takes the newest closed booking without a live one', () => {
    const done = order(
      'done',
      OrderStatus.Completed,
      '2026-10-20T09:00:00.000Z',
    )
    expect(currentTaskOrder([OLD_CANCELLED, done], 'AWARDED')).toBe(done)
    expect(currentTaskOrder([OLD_CANCELLED], 'AWARDED')).toBe(OLD_CANCELLED)
    expect(currentTaskOrder([OLD_CANCELLED], 'CANCELLED')).toBe(OLD_CANCELLED)
  })

  it('has none while the task is open again: its old booking is history', () => {
    expect(currentTaskOrder([OLD_CANCELLED], 'OPEN')).toBeNull()
    expect(currentTaskOrder([OLD_CANCELLED], 'DRAFT')).toBeNull()
  })

  it('keeps the first of two with the same time (the API sends newest first)', () => {
    const a = order('a', OrderStatus.Active, '2026-10-20T09:00:00.000Z')
    const b = order('b', OrderStatus.Active, '2026-10-20T09:00:00.000Z')
    expect(currentTaskOrder([a, b], 'AWARDED')).toBe(a)
  })
})
