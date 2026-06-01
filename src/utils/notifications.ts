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

export function notificationTaskHref(
  taskId: string,
  orderId?: string | null,
): string {
  if (orderId?.trim()) {
    return `/task/${taskId}?orderId=${encodeURIComponent(orderId.trim())}`
  }
  return `/task/${taskId}`
}

/** Prefer API title/body; fall back to type-based copy. */
export function notificationDisplayText(notification: NotificationLike): {
  title: string
  description: string
} {
  const title = notification.title?.trim()
  const body = notification.body?.trim()
  if (title && body) return { title, description: body }
  if (title) return { title, description: body || '' }
  return {
    title: defaultNotificationTitle(notification.type),
    description: body || title || 'Open the task for details.',
  }
}

function defaultNotificationTitle(type: string): string {
  switch (type) {
    case NotificationType.QuoteReceived:
      return 'New quote on your task'
    case NotificationType.QuoteAccepted:
      return 'Your quote was accepted'
    case NotificationType.QuoteDeclined:
      return 'Your quote was declined'
    case NotificationType.TaskCompleted:
      return 'Job marked complete'
    case NotificationType.TaskConfirmed:
      return 'Job confirmed'
    default:
      return 'Slashie update'
  }
}

export function countUnreadNotifications(
  items: ReadonlyArray<Pick<NotificationLike, 'readAt'>>,
): number {
  return items.filter((n) => !n.readAt).length
}
