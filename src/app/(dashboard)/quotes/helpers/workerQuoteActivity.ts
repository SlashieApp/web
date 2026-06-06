import { isQuoteAwarded, timeFromUnknown } from '@/utils/dashboardHelpers'
import { taskOrderSectionHref } from '@/utils/orderHelpers'

import type { NotificationActivityRow } from '../../helpers/notificationActivity'
import {
  type WorkerQuoteRow,
  workerQuoteStage,
} from '../../helpers/workerQuoteJobs'

export function buildWorkerQuoteActivityFallback(
  rows: readonly WorkerQuoteRow[],
  limit = 8,
): NotificationActivityRow[] {
  const activity: NotificationActivityRow[] = []

  for (const row of rows) {
    const stage = workerQuoteStage(row.task, row.quote, row.workerOrder)

    activity.push({
      id: `quote-sent-${row.quote.id}`,
      title: 'Quote sent',
      subtitle: row.task.title,
      happenedAt: row.quote.createdAt,
      tone: 'purple',
      href: `/tasks/${row.task.id}`,
    })

    if (isQuoteAwarded(row.quote.status)) {
      activity.push({
        id: `quote-awarded-${row.quote.id}`,
        title: 'Quote accepted',
        subtitle: row.task.title,
        happenedAt: row.quote.createdAt,
        tone: 'blue',
        href: taskOrderSectionHref(row.task.id),
      })
    }

    if (stage === 'booked') {
      activity.push({
        id: `booked-${row.quote.id}`,
        title: 'Job booked',
        subtitle: row.task.title,
        happenedAt: row.workerOrder?.createdAt ?? row.quote.createdAt,
        tone: 'mint',
        href: taskOrderSectionHref(row.task.id),
      })
    }
  }

  return activity
    .sort(
      (a, b) => timeFromUnknown(b.happenedAt) - timeFromUnknown(a.happenedAt),
    )
    .slice(0, limit)
}
