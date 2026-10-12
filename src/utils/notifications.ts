import {
  NotificationType,
  type NotificationType as NotificationTypeEnum,
} from '@codegen/schema'

export type NotificationLike = {
  id: string
  type: NotificationTypeEnum | string
  title: string
  body: string
  taskId?: string | null
  orderId?: string | null
  readAt?: string | null
  createdAt: unknown
}

export type NotificationDisplayCopy = {
  openTaskDetails: string
  types: {
    quoteReceived: string
    quoteAccepted: string
    quoteDeclined: string
    orderMarkedDone: string
    orderMarkedFailed: string
    orderCompleted: string
    orderConflict: string
    orderCancelled: string
    rescheduleRequested: string
    rescheduleConfirmed: string
    rescheduleDeclined: string
    cancellationRequested: string
    cancellationDeclined: string
    default: string
  }
}

const DEFAULT_DISPLAY_COPY: NotificationDisplayCopy = {
  openTaskDetails: 'Open the task for details.',
  types: {
    quoteReceived: 'New quote on your task',
    quoteAccepted: 'Your quote was accepted',
    quoteDeclined: 'Your quote was declined',
    orderMarkedDone: 'Job marked Done',
    orderMarkedFailed: 'Job marked Failed',
    orderCompleted: 'Job completed',
    orderConflict: 'Booking needs resolving',
    orderCancelled: 'Booking cancelled',
    rescheduleRequested: 'New time requested',
    rescheduleConfirmed: 'New time confirmed',
    rescheduleDeclined: 'Time change declined',
    cancellationRequested: 'Cancellation requested',
    cancellationDeclined: 'Cancellation declined',
    default: 'Slashie update',
  },
}

export function notificationTaskHref(
  taskId?: string | null,
  orderId?: string | null,
): string {
  const task = taskId?.trim()
  if (!task) return '/tasks'
  if (orderId?.trim()) {
    return `/tasks/${task}?orderId=${encodeURIComponent(orderId.trim())}`
  }
  return `/tasks/${task}`
}

/** Prefer API title/body; fall back to type-based copy. */
export function notificationDisplayText(
  notification: NotificationLike,
  copy: NotificationDisplayCopy = DEFAULT_DISPLAY_COPY,
): {
  title: string
  description: string
} {
  const title = notification.title?.trim()
  const body = notification.body?.trim()
  if (title && body) return { title, description: body }
  if (title) return { title, description: body || '' }
  return {
    title: defaultNotificationTitle(notification.type, copy),
    description: body || title || copy.openTaskDetails,
  }
}

function defaultNotificationTitle(
  type: string,
  copy: NotificationDisplayCopy,
): string {
  switch (type) {
    case NotificationType.QuoteReceived:
      return copy.types.quoteReceived
    case NotificationType.QuoteAccepted:
      return copy.types.quoteAccepted
    case NotificationType.QuoteDeclined:
      return copy.types.quoteDeclined
    case NotificationType.OrderMarkedDone:
      return copy.types.orderMarkedDone
    case NotificationType.OrderMarkedFailed:
      return copy.types.orderMarkedFailed
    case NotificationType.OrderCompleted:
      return copy.types.orderCompleted
    case NotificationType.OrderConflict:
      return copy.types.orderConflict
    case NotificationType.OrderCancelled:
      return copy.types.orderCancelled
    case NotificationType.RescheduleRequested:
      return copy.types.rescheduleRequested
    case NotificationType.RescheduleConfirmed:
      return copy.types.rescheduleConfirmed
    case NotificationType.RescheduleDeclined:
      return copy.types.rescheduleDeclined
    case NotificationType.CancellationRequested:
      return copy.types.cancellationRequested
    case NotificationType.CancellationDeclined:
      return copy.types.cancellationDeclined
    default:
      return copy.types.default
  }
}

export function countUnreadNotifications(
  items: ReadonlyArray<Pick<NotificationLike, 'readAt'>>,
): number {
  return items.filter((n) => !n.readAt).length
}

const TASK_DETAIL_NOTIFICATION_TYPES = new Set<string>([
  NotificationType.QuoteReceived,
  NotificationType.QuoteAccepted,
  NotificationType.QuoteDeclined,
  NotificationType.OrderMarkedDone,
  NotificationType.OrderMarkedFailed,
  NotificationType.OrderCompleted,
  NotificationType.OrderConflict,
  NotificationType.OrderCancelled,
  NotificationType.RescheduleRequested,
  NotificationType.RescheduleConfirmed,
  NotificationType.RescheduleDeclined,
  NotificationType.CancellationRequested,
  NotificationType.CancellationDeclined,
])

/**
 * Drawer, land-popup, and push clicks share this path.
 * Review prompts open the review page. Other task-linked types open the task.
 */
export function notificationHref(
  notification: Pick<NotificationLike, 'type' | 'taskId' | 'orderId'>,
): string {
  const taskId = notification.taskId?.trim()
  if (notification.type === 'REVIEW_PROMPT') {
    if (!taskId) return '/tasks'
    const orderId = notification.orderId?.trim()
    const path = `/tasks/${taskId}/review`
    return orderId ? `${path}?orderId=${encodeURIComponent(orderId)}` : path
  }
  if (TASK_DETAIL_NOTIFICATION_TYPES.has(notification.type)) {
    return notificationTaskHref(taskId, notification.orderId)
  }
  if (taskId) return notificationTaskHref(taskId, notification.orderId)
  return '/tasks'
}

export type ToastableNotification = {
  id: string
  readAt?: string | null
  isPopup?: boolean | null
}

/**
 * First authenticated paint toasts every unread non-popup and marks the
 * current ids seen. Later polls toast only newly arrived unread non-popups.
 */
export function notificationToastPlan(input: {
  items: readonly ToastableNotification[]
  bootstrapped: boolean
  seenIds: ReadonlySet<string>
}): { toastIds: string[]; seenIds: Set<string> } {
  const seenIds = new Set(input.seenIds)
  const toastIds: string[] = []
  if (!input.bootstrapped) {
    for (const item of input.items) {
      seenIds.add(item.id)
      if (!item.readAt && item.isPopup !== true) toastIds.push(item.id)
    }
    return { toastIds, seenIds }
  }
  for (const item of input.items) {
    if (item.readAt || item.isPopup === true || seenIds.has(item.id)) continue
    seenIds.add(item.id)
    toastIds.push(item.id)
  }
  return { toastIds, seenIds }
}
