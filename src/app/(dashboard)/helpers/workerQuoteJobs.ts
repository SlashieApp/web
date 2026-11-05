import { OrderStatus, QuoteStatus } from '@codegen/schema'

import {
  type MyQuoteItem,
  type TaskItem,
  type TaskQuoteItem,
  formatRelativeAgo,
  isQuoteAwarded,
  isTaskCompleted,
} from '@/utils/dashboardHelpers'
import {
  type OrderItem,
  isOrderClosed,
  orderAgreedPricePence,
} from '@/utils/orderHelpers'
import { priceToPence } from '@/utils/price'

export type WorkerQuoteStage = 'pending' | 'booked' | 'closed' | 'ended'

/** Compact horizontal progress labels for worker quote cards. */
export type WorkerQuoteCardProgressStep = {
  key: string
  label: string
  detail: string
  done: boolean
}

/**
 * Worker-facing quote amount. `Task.quotes[].price` is poster-only in the API;
 * fall back to the matched order's `agreedPrice` when booked.
 */
export function workerQuotePricePence(
  quote: TaskQuoteItem,
  workerOrder: OrderItem | null,
): number | null {
  const fromQuote = priceToPence(quote.price)
  if (fromQuote != null && fromQuote > 0) return fromQuote

  if (
    workerOrder &&
    workerOrder.quoteId === quote.id &&
    workerOrder.taskId === quote.taskId
  ) {
    const fromOrder = orderAgreedPricePence(workerOrder)
    if (fromOrder > 0) return fromOrder
  }

  return fromQuote
}

/** Only a PENDING quote is still in play; any other status (withdrawn, closed, or one this build doesn't know) is over. */
function isQuoteLive(status: string): boolean {
  return status.trim().toUpperCase() === QuoteStatus.Pending
}

function anotherWorkerBooked(task: TaskItem, myQuoteId: string): boolean {
  return (task.quotes ?? []).some(
    (q) => q.id !== myQuoteId && isQuoteAwarded(q.status),
  )
}

export function workerQuoteStage(
  task: TaskItem,
  quote: TaskQuoteItem,
  workerOrder: OrderItem | null,
): WorkerQuoteStage {
  if (workerOrder && isOrderClosed(workerOrder.status)) return 'closed'
  if (workerOrder && workerOrder.status !== OrderStatus.Cancelled) {
    return 'booked'
  }
  if (isQuoteAwarded(quote.status)) return 'booked'
  if (!isQuoteLive(quote.status)) return 'ended'
  if (anotherWorkerBooked(task, quote.id)) return 'ended'
  if (isTaskCompleted(task.status)) return 'ended'
  if (task.status.toUpperCase() === 'CANCELLED') return 'ended'
  return 'pending'
}

export function workerQuoteStageLabel(stage: WorkerQuoteStage): string {
  switch (stage) {
    case 'pending':
      return 'Quote sent'
    case 'booked':
      return 'Booked'
    case 'closed':
      return 'Completed'
    case 'ended':
      return 'Closed'
  }
}

export function workerQuoteCardProgressSteps(
  task: TaskItem,
  quote: TaskQuoteItem,
  workerOrder: OrderItem | null,
): WorkerQuoteCardProgressStep[] {
  const stage = workerQuoteStage(task, quote, workerOrder)
  const accepted =
    stage === 'booked' ||
    stage === 'closed' ||
    isQuoteAwarded(quote.status) ||
    Boolean(workerOrder)
  const completed = stage === 'closed'

  const acceptedAt =
    workerOrder?.createdAt ??
    (accepted && isQuoteAwarded(quote.status) ? quote.createdAt : null)
  const completedAt = workerOrder?.closedAt ?? task.completedAt

  return [
    {
      key: 'sent',
      label: 'Sent',
      detail: formatRelativeAgo(quote.createdAt) || '—',
      done: true,
    },
    {
      key: 'accepted',
      label: 'Accepted',
      detail: accepted ? formatRelativeAgo(acceptedAt) || '—' : '—',
      done: accepted,
    },
    {
      key: 'completed',
      label: 'Completed',
      detail: completed ? formatRelativeAgo(completedAt) || '—' : '—',
      done: completed,
    },
  ]
}

export type WorkerQuoteRow = MyQuoteItem & {
  workerOrder: OrderItem | null
}
