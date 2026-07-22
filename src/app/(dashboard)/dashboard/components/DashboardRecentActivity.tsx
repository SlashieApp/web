'use client'

import { useMemo } from 'react'

import { InboxActivityPanel } from '@/app/(dashboard)/components/InboxActivityPanel'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { notificationRowsFromQuery } from '@/app/(dashboard)/helpers/notificationActivity'
import { useI11n } from '@/i18n/useI11n'
import type { MyQuoteItem, TaskItem } from '@/utils/dashboardHelpers'

import { buildDashboardActivityFallback } from '../helpers/buildDashboardActivity'
import bag from '../i11n.json'

export function DashboardRecentActivity({
  postedTasks,
  sentQuotes,
}: {
  postedTasks: readonly TaskItem[]
  sentQuotes: readonly MyQuoteItem[]
}) {
  const t = useI11n(bag)
  const notifications = useNotificationsOptional()

  const rows = useMemo(() => {
    if (notifications?.items.length) {
      return notificationRowsFromQuery(notifications.items, 8)
    }
    return buildDashboardActivityFallback(postedTasks, sentQuotes)
  }, [notifications?.items, postedTasks, sentQuotes])

  return (
    <InboxActivityPanel
      title={t.activity.title}
      description={t.activity.description}
      viewAllHref="/requests"
      viewAllLabel={t.activity.viewAll}
      rows={rows}
      loading={notifications?.loading}
      emptyMessage={t.activity.empty}
      emptyActionHref="/tasks/create"
      emptyActionLabel={t.activity.emptyAction}
    />
  )
}
