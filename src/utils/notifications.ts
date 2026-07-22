import {
  NotificationType,
  type NotificationType as NotificationTypeEnum,
} from '@codegen/schema'

export type NotificationLike = {
  id: string
  type: NotificationTypeEnum | string
  title: string
  body: string
  taskId: string
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
    taskCompleted: string
    taskConfirmed: string
    default: string
  }
}

const DEFAULT_DISPLAY_COPY: NotificationDisplayCopy = {
  openTaskDetails: 'Open the task for details.',
  types: {
    quoteReceived: 'New quote on your task',
    quoteAccepted: 'Your quote was accepted',
    quoteDeclined: 'Your quote was declined',
    taskCompleted: 'Job marked complete',
    taskConfirmed: 'Job confirmed',
    default: 'Slashie update',
  },
}

export function notificationTaskHref(
  taskId: string,
  orderId?: string | null,
): string {
  if (orderId?.trim()) {
    return `/tasks/${taskId}?orderId=${encodeURIComponent(orderId.trim())}`
  }
  return `/tasks/${taskId}`
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
    case NotificationType.TaskCompleted:
      return copy.types.taskCompleted
    case NotificationType.TaskConfirmed:
      return copy.types.taskConfirmed
    default:
      return copy.types.default
  }
}

export function countUnreadNotifications(
  items: ReadonlyArray<Pick<NotificationLike, 'readAt'>>,
): number {
  return items.filter((n) => !n.readAt).length
}
