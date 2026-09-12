import { OrderStatus, QuoteStatus } from '@codegen/schema'

import {
  type PostedTaskStage,
  customerOrderForTask,
  postedTaskStage,
  postedTaskStageLabel,
} from '@/app/(dashboard)/helpers/postedTaskCustomer'
import {
  type WorkerQuoteStage,
  buildWorkerQuoteRows,
  workerQuoteStage,
  workerQuoteStageLabel,
} from '@/app/(dashboard)/helpers/workerQuoteJobs'
import {
  type MyQuoteItem,
  type TaskItem,
  isQuoteAwarded,
  timeFromUnknown,
} from '@/utils/dashboardHelpers'
import {
  type OrderItem,
  isOrderClosed,
  orderStatusChipLabel,
  taskOrderSectionHref,
} from '@/utils/orderHelpers'

export const TASK_OWNER_QUOTES_HREF = (taskId: string) =>
  `/tasks/${taskId}#owner-quotes`

export type PipelineActionKind =
  | 'respond'
  | 'accept'
  | 'markDone'
  | 'contactOffline'
  | 'view'

export type PipelineStatusTone =
  | 'success'
  | 'info'
  | 'warning'
  | 'neutral'
  | 'danger'

export type PipelineInboxRow = {
  id: string
  title: string
  href: string
  statusLabel: string
  statusTone: PipelineStatusTone
  actionKind: PipelineActionKind
  actionHref: string
  needsAttention: boolean
  happenedAt: unknown
}

export type PipelineInboxCopy = {
  waitingForQuotes: string
  awaitingConfirm: string
}

const DEFAULT_COPY: PipelineInboxCopy = {
  waitingForQuotes: 'Waiting for quotes',
  awaitingConfirm: 'Awaiting your confirm',
}

function isQuotePending(status: string): boolean {
  return status === QuoteStatus.Pending || /^pend/i.test(status.trim())
}

function isQuoteClosedOut(status: string): boolean {
  return /declin|reject|withdraw/i.test(status.trim())
}

function pendingQuotes(task: TaskItem) {
  return (task.quotes ?? []).filter(
    (quote) => !isQuoteAwarded(quote.status) && !isQuoteClosedOut(quote.status),
  )
}

function postedStatusTone(stage: PostedTaskStage): PipelineStatusTone {
  switch (stage) {
    case 'booked':
      return 'success'
    case 'quoting':
      return 'warning'
    case 'cancelled':
      return 'danger'
    case 'done':
      return 'info'
    default:
      return 'neutral'
  }
}

function workStatusTone(stage: WorkerQuoteStage): PipelineStatusTone {
  switch (stage) {
    case 'booked':
      return 'success'
    case 'pending':
      return 'info'
    default:
      return 'neutral'
  }
}

function customerBookedAction(order: OrderItem | null): {
  actionKind: PipelineActionKind
  statusLabel: string
  copyKey?: keyof PipelineInboxCopy
} {
  if (order?.status === OrderStatus.WorkCompleted) {
    return {
      actionKind: 'markDone',
      statusLabel: '',
      copyKey: 'awaitingConfirm',
    }
  }
  if (order?.status === OrderStatus.PaymentAcknowledged) {
    return {
      actionKind: 'contactOffline',
      statusLabel: orderStatusChipLabel(order.status),
    }
  }
  return { actionKind: 'contactOffline', statusLabel: '' }
}

function workerBookedAction(order: OrderItem | null): PipelineActionKind {
  if (
    order?.status === OrderStatus.WorkCompleted ||
    order?.status === OrderStatus.PaymentAcknowledged
  ) {
    return 'contactOffline'
  }
  return 'markDone'
}

function sortInboxRows(rows: PipelineInboxRow[]): PipelineInboxRow[] {
  return [...rows].sort((a, b) => {
    if (a.needsAttention !== b.needsAttention) {
      return a.needsAttention ? -1 : 1
    }
    return timeFromUnknown(b.happenedAt) - timeFromUnknown(a.happenedAt)
  })
}

export function buildPostedByMeRows(
  postedTasks: readonly TaskItem[],
  orders: readonly OrderItem[],
  userId: string,
  copy: PipelineInboxCopy = DEFAULT_COPY,
): PipelineInboxRow[] {
  const rows: PipelineInboxRow[] = []

  for (const task of postedTasks) {
    const order = customerOrderForTask(orders, task.id, userId)
    const stage = postedTaskStage(task, order)
    if (stage === 'done' || stage === 'cancelled') continue

    const href = `/tasks/${task.id}`
    let actionKind: PipelineActionKind = 'view'
    let actionHref = href
    let statusLabel = postedTaskStageLabel(stage)
    let needsAttention = false

    if (stage === 'quoting') {
      const pending = pendingQuotes(task)
      if (pending.length === 1) {
        actionKind = 'accept'
        actionHref = TASK_OWNER_QUOTES_HREF(task.id)
        needsAttention = true
      } else if (pending.length > 1) {
        actionKind = 'respond'
        actionHref = TASK_OWNER_QUOTES_HREF(task.id)
        needsAttention = true
      }
    } else if (stage === 'draft') {
      statusLabel = copy.waitingForQuotes
    } else if (stage === 'booked') {
      const booked = customerBookedAction(order)
      actionKind = booked.actionKind
      actionHref = taskOrderSectionHref(task.id)
      needsAttention = true
      statusLabel = booked.copyKey
        ? copy[booked.copyKey]
        : booked.statusLabel || postedTaskStageLabel(stage)
    }

    rows.push({
      id: `posted-${task.id}`,
      title: task.title,
      href,
      statusLabel,
      statusTone: postedStatusTone(stage),
      actionKind,
      actionHref,
      needsAttention,
      happenedAt: order?.createdAt ?? task.createdAt,
    })
  }

  return sortInboxRows(rows)
}

export function buildWorkImOnRows(
  sentQuotes: readonly MyQuoteItem[],
  orders: readonly OrderItem[],
  userId: string,
): PipelineInboxRow[] {
  const quoteRows = buildWorkerQuoteRows(sentQuotes, orders, userId)
  const rows: PipelineInboxRow[] = []
  const seenTaskIds = new Set<string>()

  for (const { task, quote, workerOrder } of quoteRows) {
    const stage = workerQuoteStage(task, quote, workerOrder)
    if (stage === 'closed' || stage === 'ended') continue

    seenTaskIds.add(task.id)
    const href = `/tasks/${task.id}`
    let actionKind: PipelineActionKind = 'view'
    let actionHref = href
    let statusLabel = workerQuoteStageLabel(stage)
    let needsAttention = false

    if (stage === 'booked') {
      actionKind = workerBookedAction(workerOrder)
      actionHref = taskOrderSectionHref(task.id)
      needsAttention = true
      if (workerOrder && workerOrder.status !== OrderStatus.Active) {
        statusLabel = orderStatusChipLabel(workerOrder.status)
      }
    }

    rows.push({
      id: `work-${quote.id}`,
      title: task.title,
      href,
      statusLabel,
      statusTone: workStatusTone(stage),
      actionKind,
      actionHref,
      needsAttention,
      happenedAt: workerOrder?.createdAt ?? quote.createdAt,
    })
  }

  for (const order of orders) {
    if (order.workerUserId !== userId) continue
    if (isOrderClosed(order.status)) continue
    if (seenTaskIds.has(order.taskId)) continue

    const actionKind = workerBookedAction(order)
    rows.push({
      id: `work-order-${order.id}`,
      title: order.snapshot.title,
      href: `/tasks/${order.taskId}`,
      statusLabel: orderStatusChipLabel(order.status),
      statusTone: 'success',
      actionKind,
      actionHref: taskOrderSectionHref(order.taskId),
      needsAttention: true,
      happenedAt: order.createdAt,
    })
  }

  return sortInboxRows(rows)
}

export function countNeedsAttention(rows: readonly PipelineInboxRow[]): number {
  return rows.filter((row) => row.needsAttention).length
}
