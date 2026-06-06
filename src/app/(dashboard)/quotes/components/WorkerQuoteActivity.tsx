'use client'

import { useMemo } from 'react'

import { InboxActivityPanel } from '@/app/(dashboard)/components/InboxActivityPanel'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { notificationRowsFromQuery } from '@/app/(dashboard)/helpers/notificationActivity'

import { useWorkerQuotes } from '../context/WorkerQuotesProvider'
import { buildWorkerQuoteActivityFallback } from '../helpers/workerQuoteActivity'

export function WorkerQuoteActivity() {
  const { quoteRows } = useWorkerQuotes()
  const notifications = useNotificationsOptional()

  const rows = useMemo(() => {
    if (notifications?.items.length) {
      return notificationRowsFromQuery(notifications.items, 8)
    }
    return buildWorkerQuoteActivityFallback(quoteRows)
  }, [notifications?.items, quoteRows])

  return (
    <InboxActivityPanel
      rows={rows}
      loading={notifications?.loading}
      emptyMessage="No quote activity yet. Send a quote to get started."
    />
  )
}
