import {
  type MyOrdersQuery,
  type OrderQuery,
  OrderStatus,
} from '@codegen/schema'

import { formatPounds } from '@/utils/dashboardHelpers'
import {
  type TaskDatetimeLike,
  parseTaskScheduleDate,
  scheduleChipForTask,
} from '@/utils/taskJobSchedule'

export type OrderItem = MyOrdersQuery['myOrders'][number] &
  Pick<
    NonNullable<OrderQuery['order']>,
    'completionVerificationCode' | 'createdAt'
  >

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
  return `/task/${order.taskId}?orderId=${order.id}`
}

export function orderDashboardHref(orderId: string): string {
  return `/dashboard/orders/${orderId}`
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
      label: cancelled ? 'Cancelled' : 'Job in progress',
      done: status !== OrderStatus.Active,
      current: status === OrderStatus.Active,
    },
    {
      key: 'closed',
      label: 'Closed',
      at: order.closedAt,
      done: closed,
      current: closed,
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
