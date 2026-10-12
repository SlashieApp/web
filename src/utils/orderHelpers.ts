import {
  type MyOrdersQuery,
  OrderCloseKind,
  OrderRequestKind,
  OrderStatus,
  TaskDateTimeType,
  type TaskQuery,
} from '@codegen/schema'

import { formatPounds } from '@/utils/dashboardHelpers'
import {
  type TaskDatetimeLike,
  parseTaskScheduleDate,
  scheduleChipForTask,
} from '@/utils/taskJobSchedule'

/** Detail-page order shape (client-fetched via Task.gql). */
export type OrderItem = NonNullable<TaskQuery['task']>['orders'][number]

export type MyOrdersListItem = NonNullable<
  NonNullable<MyOrdersQuery['me']>['orders']
>[number]

export function orderAgreedPricePence(order: OrderItem): number {
  const amount = order.agreedPrice?.amount
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return 0
  return Math.round(amount * 100)
}

const pad2 = (n: number) => String(n).padStart(2, '0')

/**
 * The booked start (from the accepted or rescheduled slot) as an exact
 * schedule in local time, so the shared schedule helpers (chips, labels,
 * countdowns) read the booking, not the poster's original preference.
 */
export function orderBookedDatetime(
  order: Pick<OrderItem, 'bookedStart'>,
): TaskDatetimeLike | null {
  const start = new Date(String(order.bookedStart))
  if (Number.isNaN(start.getTime())) return null
  return {
    date: `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`,
    time: `${pad2(start.getHours())}:${pad2(start.getMinutes())}`,
    type: TaskDateTimeType.Exact,
  }
}

export function scheduleChipForOrder(order: OrderItem) {
  return scheduleChipForTask(orderBookedDatetime(order))
}

export function sortOrdersBySchedule(orders: OrderItem[]): OrderItem[] {
  return [...orders].sort((a, b) => {
    const aWhen =
      parseTaskScheduleDate(orderBookedDatetime(a))?.getTime() ??
      Number.MAX_SAFE_INTEGER
    const bWhen =
      parseTaskScheduleDate(orderBookedDatetime(b))?.getTime() ??
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
      return 'Booked'
    case OrderStatus.Rescheduling:
      return 'Reschedule requested'
    case OrderStatus.CancelRequested:
      return 'Cancellation requested'
    case OrderStatus.Conflict:
      return 'Needs resolving'
    case OrderStatus.Completed:
      return 'Completed'
    case OrderStatus.Cancelled:
      return 'Cancelled'
    default:
      return String(status).replaceAll('_', ' ').toLowerCase()
  }
}

export function isOrderClosed(status: OrderStatus | string): boolean {
  return status === OrderStatus.Completed || status === OrderStatus.Cancelled
}

/**
 * Booked and still on: the job is happening (a reschedule or cancellation
 * request may be waiting). CONFLICT and the terminal statuses are not live.
 */
export function isOrderLive(status: OrderStatus | string): boolean {
  return (
    status === OrderStatus.Active ||
    status === OrderStatus.Rescheduling ||
    status === OrderStatus.CancelRequested
  )
}

/** Worker pending earnings: booked jobs not yet settled or in dispute. */
export function isOrderPendingEarnings(status: OrderStatus | string): boolean {
  return isOrderLive(status)
}

/** Worker completed earnings tally: completed orders only. */
export function isOrderCompletedEarnings(
  status: OrderStatus | string,
): boolean {
  return status === OrderStatus.Completed
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
  return '/tasks'
}

export type OrderCloseActionKind = 'DONE' | 'FAILED'

/** Who has marked Done/Failed, and whether the viewer can act now. */
export type OrderCloseView = {
  /** ACTIVE, on/after the booked start: Done and Failed are available. */
  canClose: boolean
  startsAt: Date | null
  mine: OrderCloseActionKind | null
  theirs: OrderCloseActionKind | null
  /** Seven days after a one-sided Done, the silent party becomes Done. */
  autoDoneAt: Date | null
}

function closeKind(
  action: { kind: OrderCloseKind | string } | null | undefined,
): OrderCloseActionKind | null {
  if (!action) return null
  return action.kind === OrderCloseKind.Failed ? 'FAILED' : 'DONE'
}

export function orderCloseView(
  order: Pick<
    OrderItem,
    | 'status'
    | 'bookedStart'
    | 'myCloseAction'
    | 'counterpartyCloseAction'
    | 'autoDoneAt'
  >,
  now = new Date(),
): OrderCloseView {
  const startsAt = new Date(String(order.bookedStart))
  const validStart = Number.isNaN(startsAt.getTime()) ? null : startsAt
  const autoDone = order.autoDoneAt ? new Date(String(order.autoDoneAt)) : null
  return {
    canClose:
      order.status === OrderStatus.Active &&
      validStart != null &&
      validStart.getTime() <= now.getTime(),
    startsAt: validStart,
    mine: closeKind(order.myCloseAction),
    theirs: closeKind(order.counterpartyCloseAction),
    autoDoneAt: autoDone && !Number.isNaN(autoDone.getTime()) ? autoDone : null,
  }
}

export type OrderRequestView = {
  kind: 'RESCHEDULE' | 'CANCEL'
  /** The viewer made the request (can withdraw); otherwise they must answer. */
  mine: boolean
  proposedSlots: NonNullable<OrderItem['pendingRequest']>['proposedSlots']
}

export function orderRequestView(
  order: Pick<OrderItem, 'pendingRequest'>,
  viewerId: string | null | undefined,
): OrderRequestView | null {
  const request = order.pendingRequest
  if (!request) return null
  return {
    kind:
      request.kind === OrderRequestKind.Reschedule ? 'RESCHEDULE' : 'CANCEL',
    mine: Boolean(viewerId && request.requestedByUserId === viewerId),
    proposedSlots: request.proposedSlots,
  }
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
  const created: OrderTimelineStep = {
    key: 'created',
    label: 'Order created',
    at: order.createdAt,
    done: true,
    current: false,
  }
  const booked: OrderTimelineStep = {
    key: 'booked',
    label: 'Booked',
    at: order.bookedStart,
    done: !isOrderLive(status),
    current: isOrderLive(status),
  }

  if (status === OrderStatus.Cancelled) {
    return [
      created,
      booked,
      {
        key: 'cancelled',
        label: 'Order cancelled',
        at: order.closedAt,
        done: true,
        current: true,
      },
    ]
  }

  if (status === OrderStatus.Conflict) {
    return [
      created,
      booked,
      {
        key: 'conflict',
        label: 'Needs resolving',
        done: false,
        current: true,
      },
    ]
  }

  const completed = status === OrderStatus.Completed
  return [
    created,
    booked,
    {
      key: 'closed',
      label: 'Order completed',
      at: order.closedAt,
      done: completed,
      current: completed,
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
