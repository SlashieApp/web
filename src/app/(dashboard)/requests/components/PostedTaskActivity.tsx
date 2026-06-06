'use client'

import { useMemo } from 'react'

import { InboxActivityPanel } from '@/app/(dashboard)/components/InboxActivityPanel'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { notificationRowsFromQuery } from '@/app/(dashboard)/helpers/notificationActivity'

import { useMyRequestsPage } from '../context/MyRequestsProvider'
import { buildPostedTaskActivityFallback } from '../helpers/postedTaskActivity'

export function PostedTaskActivity() {
  const { taskRows } = useMyRequestsPage()
  const notifications = useNotificationsOptional()

  const rows = useMemo(() => {
    if (notifications?.items.length) {
      return notificationRowsFromQuery(notifications.items, 8)
    }
    return buildPostedTaskActivityFallback(taskRows)
  }, [notifications?.items, taskRows])

  return (
    <InboxActivityPanel
      rows={rows}
      loading={notifications?.loading}
      emptyMessage="No request activity yet. Post a task to get started."
    />
  )
}
