'use client'

import { useMemo } from 'react'

import { InboxActivityPanel } from '@/app/(dashboard)/components/InboxActivityPanel'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { notificationRowsFromQuery } from '@/app/(dashboard)/helpers/notificationActivity'
import type { MyQuoteItem, TaskItem } from '@/utils/dashboardHelpers'

import { buildDashboardActivityFallback } from '../helpers/buildDashboardActivity'

export function DashboardRecentActivity({
  postedTasks,
  sentQuotes,
}: {
  postedTasks: readonly TaskItem[]
  sentQuotes: readonly MyQuoteItem[]
}) {
  const notifications = useNotificationsOptional()

  const rows = useMemo(() => {
    if (notifications?.items.length) {
      return notificationRowsFromQuery(notifications.items, 8)
    }
    return buildDashboardActivityFallback(postedTasks, sentQuotes)
  }, [notifications?.items, postedTasks, sentQuotes])

  return (
    <InboxActivityPanel
      title="Recent activity"
      description="Latest updates across your requests, jobs, and quotes."
      viewAllHref="/requests"
      viewAllLabel="View all"
      rows={rows}
      loading={notifications?.loading}
      emptyMessage="No activity yet. Start by posting a task or sending a quote."
      emptyActionHref="/tasks/create"
      emptyActionLabel="Post a task"
    />
  )
}
