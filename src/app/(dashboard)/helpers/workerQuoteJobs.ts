import { OrderStatus } from '@codegen/schema'

import { normaliseTaskStatusForBadge } from '@/app/(task)/tasks/[slug]/helpers/taskDetailUtils'
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

export type WorkerQuoteTimelineStep = {
  key: string
  label: string
  detail?: string
  at?: unknown
  done: boolean
  current: boolean
}

/** Compact horizontal progress labels for worker quote cards. */
export type WorkerQuoteCardProgressStep = {
  key: string
  label: string
  detail: string
  done: boolean
}

export function workerOrderForTask(
  orders: readonly OrderItem[],
  taskId: string,
  workerUserId: string,
  quoteId?: string,
): OrderItem | null {
  if (quoteId) {
    const byQuote = orders.find(
      (o) =>
        o.quoteId === quoteId &&
        o.workerUserId === workerUserId &&
        o.taskId === taskId,
    )
    if (byQuote) return byQuote
  }

  return (
    orders.find(
      (o) => o.taskId === taskId && o.workerUserId === workerUserId,
    ) ?? null
  )
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

function isQuoteDeclined(status: string): boolean {
  return /declin|reject/i.test(status.trim())
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
  if (isQuoteDeclined(quote.status)) return 'ended'
  if (anotherWorkerBooked(task, quote.id)) return 'ended'
  if (isTaskCompleted(task.status)) return 'ended'
  if (task.status.toUpperCase() === 'CANCELLED') return 'ended'
  return 'pending'
}

export function isWorkerQuoteArchived(
  task: TaskItem,
  quote: TaskQuoteItem,
  workerOrder: OrderItem | null,
): boolean {
  const stage = workerQuoteStage(task, quote, workerOrder)
  return stage === 'closed' || stage === 'ended'
}

export type WorkerQuoteListFilter = 'all' | 'pending' | 'booked' | 'done'

export function workerQuoteMatchesFilter(
  stage: WorkerQuoteStage,
  filter: WorkerQuoteListFilter,
): boolean {
  if (filter === 'all') return true
  if (filter === 'pending') return stage === 'pending'
  if (filter === 'booked') return stage === 'booked'
  return stage === 'closed' || stage === 'ended'
}

export function workerQuoteFilterLabel(filter: WorkerQuoteListFilter): string {
  switch (filter) {
    case 'all':
      return 'All'
    case 'pending':
      return 'Pending'
    case 'booked':
      return 'Booked'
    case 'done':
      return 'Done'
  }
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

export function workerQuoteTimelineSteps(
  task: TaskItem,
  quote: TaskQuoteItem,
  workerOrder: OrderItem | null,
): WorkerQuoteTimelineStep[] {
  const stage = workerQuoteStage(task, quote, workerOrder)
  const awarded = isQuoteAwarded(quote.status) || Boolean(workerOrder)
  const orderClosed = Boolean(workerOrder && isOrderClosed(workerOrder.status))

  return [
    {
      key: 'sent',
      label: 'Quote sent',
      detail: `Your offer · ${normaliseTaskStatusForBadge(quote.status)}`,
      at: quote.createdAt,
      done: true,
      current: false,
    },
    {
      key: 'review',
      label: awarded ? 'Quote accepted' : 'Owner reviewing',
      detail: awarded
        ? 'You were selected for this job'
        : anotherWorkerBooked(task, quote.id)
          ? 'Another pro was booked'
          : isQuoteDeclined(quote.status)
            ? 'Quote not selected'
            : 'Waiting for the customer to decide',
      done: awarded || stage === 'ended',
      current: stage === 'pending',
    },
    {
      key: 'job',
      label: 'Job in progress',
      detail:
        workerOrder?.status === OrderStatus.Active
          ? 'Complete work and enter the customer code on the task page'
          : undefined,
      at: workerOrder?.createdAt,
      done: orderClosed || stage === 'closed',
      current: stage === 'booked',
    },
    {
      key: 'done',
      label: stage === 'ended' ? 'Ended' : 'Job closed',
      at: workerOrder?.closedAt ?? task.completedAt,
      done: stage === 'closed' || stage === 'ended',
      current: stage === 'closed' || stage === 'ended',
    },
  ]
}

export type WorkerQuoteRow = MyQuoteItem & {
  workerOrder: OrderItem | null
}

export function buildWorkerQuoteRows(
  sentQuotes: readonly MyQuoteItem[],
  orders: readonly OrderItem[],
  workerUserId: string,
): WorkerQuoteRow[] {
  return sentQuotes.map(({ task, quote }) => ({
    task,
    quote,
    workerOrder: workerOrderForTask(orders, task.id, workerUserId, quote.id),
  }))
}
