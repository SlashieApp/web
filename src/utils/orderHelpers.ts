import {
  type MyOrdersQuery,
  OrderStatus,
  type TaskQuery,
} from '@codegen/schema'

import { formatPounds } from '@/utils/dashboardHelpers'
import {
  type TaskDatetimeLike,
  parseTaskScheduleDate,
  scheduleChipForTask,
} from '@/utils/taskJobSchedule'

export type OrderItem = NonNullable<TaskQuery['order']>

export type MyOrdersListItem = MyOrdersQuery['myOrders'][number]

export function orderAgreedPricePence(order: OrderItem): number {
  const amount = order.agreedPrice?.amount
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return 0
  return Math.round(amount * 100)
}

export function orderSnapshotDatetime(
  order: OrderItem,
): TaskDatetimeLike | null {
  const dt = order.snapshot?.datetime
  if (!dt) return null
  return {
    date: dt.date,
    time: dt.time,
    type: dt.type,
  }
}

export function scheduleChipForOrder(order: OrderItem) {
  return scheduleChipForTask(orderSnapshotDatetime(order))
}

export function sortOrdersBySchedule(orders: OrderItem[]): OrderItem[] {
  return [...orders].sort((a, b) => {
    const aWhen =
      parseTaskScheduleDate(orderSnapshotDatetime(a))?.getTime() ??
      Number.MAX_SAFE_INTEGER
    const bWhen =
      parseTaskScheduleDate(orderSnapshotDatetime(b))?.getTime() ??
      Number.MAX_SAFE_INTEGER
    return aWhen - bWhen
  })
}

export function sortOrdersByClosedAtDesc(orders: OrderItem[]): OrderItem[] {
  return [...orders].sort((a, b) => {
    const aWhen = a.closedAt ? new Date(String(a.closedAt)).getTime() : 0
    const bWhen = b.closedAt ? new Date(String(b.closedAt)).getTime() : 0
    if (bWhen !== aWhen) return bWhen - aWhen
    return (
      new Date(String(b.createdAt)).getTime() -
      new Date(String(a.createdAt)).getTime()
    )
  })
}

export function orderStatusChipLabel(status: OrderStatus | string): string {
  switch (status) {
    case OrderStatus.Active:
      return 'Active'
    case OrderStatus.WorkCompleted:
      return 'Done'
    case OrderStatus.PaymentAcknowledged:
      return 'Awaiting payment'
    case OrderStatus.Closed:
      return 'Closed'
    case OrderStatus.Cancelled:
      return 'Cancelled'
    default:
      return String(status).replaceAll('_', ' ').toLowerCase()
  }
}

export function isOrderClosed(status: OrderStatus | string): boolean {
  return status === OrderStatus.Closed || status === OrderStatus.Cancelled
}

/** Worker pending earnings: only orders still in progress. */
export function isOrderPendingEarnings(status: OrderStatus | string): boolean {
  return status === OrderStatus.Active
}

/** Worker completed earnings tally: closed orders only. */
export function isOrderCompletedEarnings(
  status: OrderStatus | string,
): boolean {
  return status === OrderStatus.Closed
}

export type OrderPartyRole = 'customer' | 'worker'

export function orderPartyRole(
  order: OrderItem,
  userId: string,
): OrderPartyRole | null {
  if (order.customerUserId === userId) return 'customer'
  if (order.workerUserId === userId) return 'worker'
  return null
}

export function orderTaskHref(
  order: OrderItem | { id: string; taskId: string },
): string {
  return taskOrderSectionHref(order.taskId)
}

export const TASK_ORDER_SECTION_ID = 'task-order'

/** Deep link to the inline order block on task detail. */
export function taskOrderSectionHref(taskId: string): string {
  return `/tasks/${taskId}#${TASK_ORDER_SECTION_ID}`
}

/** @deprecated Use {@link taskOrderSectionHref}. */
export function taskOrderHref(taskId: string): string {
  return taskOrderSectionHref(taskId)
}

/** @deprecated Use {@link taskOrderSectionHref}. */
export function requestOrderHref(taskId: string): string {
  return taskOrderSectionHref(taskId)
}

/** @deprecated Use {@link taskOrderHref} with `taskId`. */
export function orderDashboardHref(_orderId: string): string {
  return '/quotes'
}

export type OrderTimelineStep = {
  key: string
  label: string
  at?: unknown
  done: boolean
  current: boolean
}

export function orderTimelineSteps(order: OrderItem): OrderTimelineStep[] {
  const status = order.status
  const closed = status === OrderStatus.Closed
  const cancelled = status === OrderStatus.Cancelled

  if (cancelled) {
    return [
      {
        key: 'created',
        label: 'Order created',
        at: order.createdAt,
        done: true,
        current: false,
      },
      {
        key: 'cancelled',
        label: 'Order cancelled',
        at: order.closedAt,
        done: true,
        current: true,
      },
    ]
  }

  const workCompleted =
    Boolean(order.workCompletedAt) ||
    status === OrderStatus.WorkCompleted ||
    status === OrderStatus.PaymentAcknowledged ||
    closed

  const paymentAcknowledged =
    Boolean(order.workerPaymentAcknowledgedAt) ||
    status === OrderStatus.PaymentAcknowledged ||
    closed

  const workCompletedCurrent = status === OrderStatus.WorkCompleted
  const paymentCurrent = status === OrderStatus.PaymentAcknowledged
  const closedCurrent = closed

  return [
    {
      key: 'created',
      label: 'Order created',
      at: order.createdAt,
      done: true,
      current: false,
    },
    {
      key: 'active',
      label: 'Job in progress',
      done: status !== OrderStatus.Active,
      current: status === OrderStatus.Active,
    },
    {
      key: 'work-completed',
      label: 'Work completed',
      at: order.workCompletedAt,
      done: workCompleted,
      current: workCompletedCurrent,
    },
    {
      key: 'payment',
      label: 'Payment acknowledged',
      at: order.workerPaymentAcknowledgedAt,
      done: paymentAcknowledged,
      current: paymentCurrent,
    },
    {
      key: 'closed',
      label: 'Order closed',
      at: order.closedAt,
      done: closed,
      current: closedCurrent,
    },
  ]
}

export function workerQuoteForOrder(
  quotes: ReadonlyArray<{
    id: string
    status: string
    worker?: {
      id: string
      profile?: { name?: string | null; avatarUrl?: string | null } | null
    } | null
  }>,
  quoteId: string,
) {
  return quotes.find((q) => q.id === quoteId) ?? null
}

export function orderLocationLabel(order: OrderItem): string {
  const loc = order.snapshot?.location
  return (
    loc?.address?.trim() ||
    loc?.name?.trim() ||
    'Location shared when your quote was accepted'
  )
}

export function formatOrderAgreedPrice(order: OrderItem): string {
  return formatPounds(orderAgreedPricePence(order))
}

export function sumOrderAgreedPricePence(orders: readonly OrderItem[]): number {
  return orders.reduce((sum, o) => sum + orderAgreedPricePence(o), 0)
}

export function activeOrdersForUser(
  orders: readonly OrderItem[],
  userId: string,
): OrderItem[] {
  return orders.filter((o) => !isOrderClosed(o.status))
}

export function customerOrders(
  orders: readonly OrderItem[],
  userId: string,
): OrderItem[] {
  return orders.filter((o) => o.customerUserId === userId)
}

export function workerOrders(
  orders: readonly OrderItem[],
  userId: string,
): OrderItem[] {
  return orders.filter((o) => o.workerUserId === userId)
}

export function findOrderForTask(
  orders: readonly OrderItem[],
  taskId: string,
  userId: string,
): OrderItem | null {
  return (
    orders.find(
      (o) => o.taskId === taskId && orderPartyRole(o, userId) != null,
    ) ?? null
  )
}
