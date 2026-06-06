import { isTaskCompleted, timeFromUnknown } from '@/utils/dashboardHelpers'
import { taskOrderSectionHref } from '@/utils/orderHelpers'

import type { NotificationActivityRow } from '../../helpers/notificationActivity'
import {
  type PostedTaskRow,
  postedTaskStage,
} from '../../helpers/postedTaskCustomer'

export function buildPostedTaskActivityFallback(
  rows: readonly PostedTaskRow[],
  limit = 8,
): NotificationActivityRow[] {
  const activity: NotificationActivityRow[] = []

  for (const row of rows) {
    const stage = postedTaskStage(row.task, row.customerOrder)
    const quoteCount = row.task.quotes?.length ?? 0

    activity.push({
      id: `posted-${row.task.id}`,
      title: 'Task posted',
      subtitle: row.task.title,
      happenedAt: row.task.createdAt,
      tone: 'mint',
      href: `/tasks/${row.task.id}`,
    })

    if (quoteCount > 0) {
      activity.push({
        id: `quotes-${row.task.id}`,
        title: `${quoteCount} quote${quoteCount === 1 ? '' : 's'} received`,
        subtitle: row.task.title,
        happenedAt: row.task.createdAt,
        tone: 'green',
        href: `/tasks/${row.task.id}`,
      })
    }

    if (stage === 'booked') {
      activity.push({
        id: `booked-${row.task.id}`,
        title: 'Worker booked',
        subtitle: row.task.title,
        happenedAt: row.customerOrder?.createdAt ?? row.task.createdAt,
        tone: 'blue',
        href: taskOrderSectionHref(row.task.id),
      })
    }

    if (isTaskCompleted(row.task.status)) {
      activity.push({
        id: `completed-${row.task.id}`,
        title: 'Job completed',
        subtitle: row.task.title,
        happenedAt:
          row.task.completedAt ?? row.task.confirmedAt ?? row.task.createdAt,
        tone: 'purple',
        href: `/tasks/${row.task.id}`,
      })
    }
  }

  return activity
    .sort(
      (a, b) => timeFromUnknown(b.happenedAt) - timeFromUnknown(a.happenedAt),
    )
    .slice(0, limit)
}
