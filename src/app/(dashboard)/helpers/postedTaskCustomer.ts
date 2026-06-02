import { OrderStatus } from '@codegen/schema'

import {
  type TaskItem,
  isQuoteAwarded,
  isTaskCompleted,
} from '@/utils/dashboardHelpers'
import { type OrderItem, isOrderClosed } from '@/utils/orderHelpers'

export type PostedTaskStage =
  | 'draft'
  | 'quoting'
  | 'booked'
  | 'done'
  | 'cancelled'

export type PostedTaskTimelineStep = {
  key: string
  label: string
  detail?: string
  at?: unknown
  done: boolean
  current: boolean
}

export function customerOrderForTask(
  orders: readonly OrderItem[],
  taskId: string,
  customerUserId: string,
): OrderItem | null {
  return (
    orders.find(
      (o) => o.taskId === taskId && o.customerUserId === customerUserId,
    ) ?? null
  )
}

export function isPostedTaskArchived(
  task: TaskItem,
  customerOrder: OrderItem | null,
): boolean {
  if (customerOrder && isOrderClosed(customerOrder.status)) return true
  return isTaskCompleted(task.status)
}

export function postedTaskStage(
  task: TaskItem,
  customerOrder: OrderItem | null,
): PostedTaskStage {
  const status = task.status.toUpperCase()
  if (status === 'CANCELLED') return 'cancelled'
  if (customerOrder && isOrderClosed(customerOrder.status)) return 'done'
  if (isTaskCompleted(task.status)) return 'done'
  if (customerOrder && customerOrder.status !== OrderStatus.Cancelled) {
    return 'booked'
  }
  if ((task.quotes ?? []).some((q) => isQuoteAwarded(q.status))) return 'booked'
  if ((task.quotes ?? []).length > 0) return 'quoting'
  return 'draft'
}

export function postedTaskStageLabel(stage: PostedTaskStage): string {
  switch (stage) {
    case 'draft':
      return 'Draft'
    case 'quoting':
      return 'Collecting quotes'
    case 'booked':
      return 'In progress'
    case 'done':
      return 'Completed'
    case 'cancelled':
      return 'Cancelled'
  }
}

export function postedTaskTimelineSteps(
  task: TaskItem,
  customerOrder: OrderItem | null,
): PostedTaskTimelineStep[] {
  const stage = postedTaskStage(task, customerOrder)
  const quoteCount = task.quotes?.length ?? 0
  const awarded = (task.quotes ?? []).find((q) => isQuoteAwarded(q.status))
  const workerName = awarded?.worker?.profile?.name?.trim()

  const quotingDone = quoteCount > 0 || stage === 'booked' || stage === 'done'
  const bookedDone =
    stage === 'done' ||
    Boolean(customerOrder && customerOrder.status !== OrderStatus.Cancelled)
  const doneDone = stage === 'done' || stage === 'cancelled'

  return [
    {
      key: 'posted',
      label: 'Task posted',
      detail: 'Live on Slashie',
      at: task.createdAt,
      done: true,
      current: stage === 'draft',
    },
    {
      key: 'quotes',
      label:
        quoteCount > 0
          ? `${quoteCount} quote${quoteCount === 1 ? '' : 's'} received`
          : 'Waiting for quotes',
      detail:
        stage === 'quoting'
          ? 'Compare and accept a pro'
          : quoteCount > 0
            ? 'Quotes received'
            : undefined,
      done: quotingDone,
      current: stage === 'quoting',
    },
    {
      key: 'booked',
      label: workerName ? `Booked · ${workerName}` : 'Worker booked',
      detail:
        customerOrder?.status === OrderStatus.Active
          ? 'Job in progress'
          : undefined,
      at: customerOrder?.createdAt,
      done: bookedDone,
      current: stage === 'booked',
    },
    {
      key: 'done',
      label: stage === 'cancelled' ? 'Cancelled' : 'Completed',
      at: customerOrder?.closedAt ?? task.completedAt ?? task.confirmedAt,
      done: doneDone,
      current: stage === 'done' || stage === 'cancelled',
    },
  ]
}
