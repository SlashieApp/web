'use client'

import { useMemo } from 'react'

import { InboxActivityPanel } from '@/app/(dashboard)/components/ui/inbox/InboxActivityPanel'
import { useI11n } from '@/i18n/useI11n'
import type { MyQuoteItem, TaskItem } from '@/utils/dashboardHelpers'

import { buildDashboardActivityFallback } from '../../helpers/buildDashboardActivity'
import bag from '../../i11n.json'

export function DashboardRecentActivity({
  postedTasks,
  sentQuotes,
}: {
  postedTasks: readonly TaskItem[]
  sentQuotes: readonly MyQuoteItem[]
}) {
  const t = useI11n(bag)

  const rows = useMemo(() => {
    return buildDashboardActivityFallback(postedTasks, sentQuotes)
  }, [postedTasks, sentQuotes])

  return (
    <InboxActivityPanel
      title={t.activity.title}
      description={t.activity.description}
      viewAllHref="/tasks"
      viewAllLabel={t.activity.viewAll}
      rows={rows}
      emptyMessage={t.activity.empty}
      emptyActionHref="/tasks/create"
      emptyActionLabel={t.activity.emptyAction}
    />
  )
}
