'use client'

import { useMemo } from 'react'

import { InboxActivityPanel } from '@/app/(dashboard)/components/InboxActivityPanel'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { notificationRowsFromQuery } from '@/app/(dashboard)/helpers/notificationActivity'
import { useI11n } from '@/i18n/useI11n'

import { useMyRequestsPage } from '../context/MyRequestsProvider'
import { buildPostedTaskActivityFallback } from '../helpers/postedTaskActivity'
import bag from '../i11n.json'

export function PostedTaskActivity() {
  const t = useI11n(bag)
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
      emptyMessage={t.activityEmpty}
    />
  )
}
