import { OrderCloseKind, OrderRequestKind, OrderStatus } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import type { OrderItem } from './orderHelpers'
import {
  orderBookedDatetime,
  orderCloseView,
  orderRequestView,
  orderTimelineSteps,
} from './orderHelpers'

function order(overrides: Partial<OrderItem>): OrderItem {
  return {
    status: OrderStatus.Active,
    createdAt: '2026-06-01T09:00:00.000Z',
    bookedStart: '2026-06-05T09:00:00.000Z',
    closedAt: null,
    pendingRequest: null,
    myCloseAction: null,
    counterpartyCloseAction: null,
    autoDoneAt: null,
    ...overrides,
  } as OrderItem
}

describe('orderTimelineSteps', () => {
  it('marks the timeline finished when the order is COMPLETED', () => {
    const steps = orderTimelineSteps(
      order({
        status: OrderStatus.Completed,
        closedAt: '2026-06-05T16:00:00.000Z',
      }),
    )
    expect(steps.find((step) => step.key === 'closed')).toMatchObject({
      done: true,
      current: true,
    })
    expect(steps.find((step) => step.key === 'booked')?.done).toBe(true)
  })

  it('keeps the booking current while the job is live', () => {
    const steps = orderTimelineSteps(
      order({ status: OrderStatus.Rescheduling }),
    )
    expect(steps.find((step) => step.key === 'booked')?.current).toBe(true)
    expect(steps.find((step) => step.key === 'closed')?.done).toBe(false)
  })

  it('ends on the conflict step', () => {
    const steps = orderTimelineSteps(order({ status: OrderStatus.Conflict }))
    expect(steps.at(-1)).toMatchObject({ key: 'conflict', current: true })
  })
})

describe('orderCloseView', () => {
  const before = new Date('2026-06-05T08:59:00.000Z')
  const after = new Date('2026-06-05T09:00:00.000Z')

  it('opens Done/Failed only for ACTIVE orders from the booked start', () => {
    expect(orderCloseView(order({}), before).canClose).toBe(false)
    expect(orderCloseView(order({}), after).canClose).toBe(true)
    expect(
      orderCloseView(order({ status: OrderStatus.Rescheduling }), after)
        .canClose,
    ).toBe(false)
  })

  it('reports each side and the auto-Done time', () => {
    const view = orderCloseView(
      order({
        myCloseAction: {
          kind: OrderCloseKind.Done,
          at: '2026-06-05T10:00:00.000Z',
        },
        autoDoneAt: '2026-06-12T10:00:00.000Z',
      }),
      after,
    )
    expect(view.mine).toBe('DONE')
    expect(view.theirs).toBeNull()
    expect(view.autoDoneAt?.toISOString()).toBe('2026-06-12T10:00:00.000Z')
  })
})

describe('orderRequestView', () => {
  it('tells the requester from the party who must answer', () => {
    const o = order({
      pendingRequest: {
        kind: OrderRequestKind.Cancel,
        requestedByUserId: 'me',
        requestedAt: '2026-06-02T09:00:00.000Z',
        proposedSlots: [],
      },
    })
    expect(orderRequestView(o, 'me')).toMatchObject({
      kind: 'CANCEL',
      mine: true,
    })
    expect(orderRequestView(o, 'other')?.mine).toBe(false)
    expect(orderRequestView(order({}), 'me')).toBeNull()
  })
})

describe('orderBookedDatetime', () => {
  it('turns the booked instant into a local exact schedule', () => {
    const local = new Date('2026-06-05T09:00:00.000Z')
    const dt = orderBookedDatetime({ bookedStart: local.toISOString() })
    expect(dt?.type).toBe('EXACT')
    expect(new Date(`${dt?.date}T${dt?.time}`).getTime()).toBe(local.getTime())
  })
})
