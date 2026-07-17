import {
  type MyQuoteItem,
  type TaskItem,
  isQuoteAwarded,
  isTaskCompleted,
  timeFromUnknown,
} from '@/utils/dashboardHelpers'

import type { NotificationActivityRow } from '../../helpers/notificationActivity'

/** Fallback activity when notifications are empty — derived from posted tasks + sent quotes. */
export function buildDashboardActivityFallback(
  postedTasks: readonly TaskItem[],
  sentQuotes: readonly MyQuoteItem[],
  limit = 6,
): NotificationActivityRow[] {
  const activity: NotificationActivityRow[] = []

  for (const task of postedTasks) {
    activity.push({
      id: `posted-${task.id}`,
      title: 'Task posted',
      subtitle: task.title,
      happenedAt: task.createdAt,
      tone: 'mint',
      href: `/tasks/${task.id}`,
    })
    if (isTaskCompleted(task.status)) {
      activity.push({
        id: `completed-${task.id}`,
        title: 'Job completed',
        subtitle: task.title,
        happenedAt: task.completedAt ?? task.confirmedAt ?? task.createdAt,
        tone: 'green',
        href: `/tasks/${task.id}`,
      })
    }
  }

  for (const { task, quote } of sentQuotes) {
    activity.push({
      id: `quote-sent-${quote.id}`,
      title: 'You sent a quote',
      subtitle: task.title,
      happenedAt: quote.createdAt,
      tone: 'purple',
      href: `/tasks/${task.id}`,
    })
    if (isQuoteAwarded(quote.status)) {
      activity.push({
        id: `quote-awarded-${quote.id}`,
        title: 'Quote accepted',
        subtitle: task.title,
        happenedAt: quote.createdAt,
        tone: 'blue',
        href: `/tasks/${task.id}`,
      })
    }
  }

  return activity
    .sort(
      (a, b) => timeFromUnknown(b.happenedAt) - timeFromUnknown(a.happenedAt),
    )
    .slice(0, limit)
}
