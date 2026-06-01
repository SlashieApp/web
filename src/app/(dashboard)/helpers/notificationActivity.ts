import { NotificationType } from '@codegen/schema'
import type { MyNotificationsQuery } from '@codegen/schema'

import { timeFromUnknown } from '@/utils/dashboardHelpers'

export type ActivityTone = 'green' | 'purple' | 'blue' | 'mint' | 'red'

export type NotificationActivityRow = {
  id: string
  title: string
  subtitle: string
  happenedAt: unknown
  tone: ActivityTone
  href: string
}

function toneForType(type: string): ActivityTone {
  switch (type) {
    case NotificationType.QuoteReceived:
      return 'green'
    case NotificationType.QuoteAccepted:
      return 'blue'
    case NotificationType.QuoteDeclined:
      return 'red'
    case NotificationType.TaskCompleted:
      return 'purple'
    case NotificationType.TaskConfirmed:
      return 'mint'
    default:
      return 'green'
  }
}

export function notificationRowsFromQuery(
  items: MyNotificationsQuery['myNotifications']['items'],
  limit = 8,
): NotificationActivityRow[] {
  return [...items]
    .sort((a, b) => timeFromUnknown(b.createdAt) - timeFromUnknown(a.createdAt))
    .slice(0, limit)
    .map((item) => ({
      id: item.id,
      title: item.title?.trim() || 'Update',
      subtitle: item.body?.trim() || 'Open task',
      happenedAt: item.createdAt,
      tone: toneForType(item.type),
      href: item.orderId
        ? `/task/${item.taskId}?orderId=${item.orderId}`
        : `/task/${item.taskId}`,
    }))
}
