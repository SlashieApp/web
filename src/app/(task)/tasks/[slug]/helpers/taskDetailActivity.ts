import { OrderStatus, QuoteStatus } from '@codegen/schema'

import type { OrderItem } from '@/utils/orderHelpers'
import { isAcceptedQuoteStatus } from '@/utils/taskJobSchedule'

import type { TaskDetailRecord } from './taskDetailUtils'

export type TaskActivityKind =
  | 'quoteCreated'
  | 'quoteAccepted'
  | 'quoteDeclined'
  | 'quoteWithdrawn'
  | 'orderCreated'
  | 'orderWorkCompleted'
  | 'orderPaymentAcknowledged'
  | 'orderClosed'
  | 'orderCancelled'

export type TaskActivityEvent = {
  id: string
  kind: TaskActivityKind
  at: string
  actorName: string | null
}

function isWithdrawnQuoteStatus(status: string): boolean {
  return status === QuoteStatus.Withdrawn || /withdraw/i.test(status)
}

function quoteActorName(
  quote: TaskDetailRecord['quotes'][number],
): string | null {
  return quote.worker?.profile?.name?.trim() || null
}

function parseTime(iso: string | null | undefined): number {
  if (!iso) return 0
  const t = new Date(iso).getTime()
  return Number.isNaN(t) ? 0 : t
}

/**
 * Lightweight activity timeline from quotes + orders already on the task
 * payload. No extra GraphQL — status-changed timestamps are not available, so
 * accepted / declined / withdrawn quotes use `createdAt`.
 */
export function buildTaskActivityEvents(input: {
  quotes: TaskDetailRecord['quotes']
  orders: ReadonlyArray<OrderItem>
}): TaskActivityEvent[] {
  const events: TaskActivityEvent[] = []

  for (const quote of input.quotes) {
    const actorName = quoteActorName(quote)
    const createdAt = quote.createdAt
    if (!createdAt) continue

    if (isWithdrawnQuoteStatus(quote.status)) {
      events.push({
        id: `quote-withdrawn-${quote.id}`,
        kind: 'quoteWithdrawn',
        at: createdAt,
        actorName,
      })
      continue
    }
    if (quote.status === QuoteStatus.Declined) {
      events.push({
        id: `quote-declined-${quote.id}`,
        kind: 'quoteDeclined',
        at: createdAt,
        actorName,
      })
      continue
    }
    if (isAcceptedQuoteStatus(quote.status)) {
      events.push({
        id: `quote-accepted-${quote.id}`,
        kind: 'quoteAccepted',
        at: createdAt,
        actorName,
      })
      continue
    }
    events.push({
      id: `quote-created-${quote.id}`,
      kind: 'quoteCreated',
      at: createdAt,
      actorName,
    })
  }

  for (const order of input.orders) {
    if (order.createdAt) {
      events.push({
        id: `order-created-${order.id}`,
        kind: 'orderCreated',
        at: order.createdAt,
        actorName: null,
      })
    }
    if (order.workCompletedAt) {
      events.push({
        id: `order-work-${order.id}`,
        kind: 'orderWorkCompleted',
        at: order.workCompletedAt,
        actorName: null,
      })
    }
    if (order.workerPaymentAcknowledgedAt) {
      events.push({
        id: `order-pay-${order.id}`,
        kind: 'orderPaymentAcknowledged',
        at: order.workerPaymentAcknowledgedAt,
        actorName: null,
      })
    }
    if (order.closedAt && order.status === OrderStatus.Closed) {
      events.push({
        id: `order-closed-${order.id}`,
        kind: 'orderClosed',
        at: order.closedAt,
        actorName: null,
      })
    }
    if (order.status === OrderStatus.Cancelled) {
      events.push({
        id: `order-cancelled-${order.id}`,
        kind: 'orderCancelled',
        at: order.closedAt || order.createdAt,
        actorName: null,
      })
    }
  }

  return events.sort((a, b) => parseTime(b.at) - parseTime(a.at))
}
