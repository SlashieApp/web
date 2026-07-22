'use client'

import { useMemo } from 'react'

import { InboxActivityPanel } from '@/app/(dashboard)/components/InboxActivityPanel'
import { useNotificationsOptional } from '@/app/(dashboard)/context/NotificationsProvider'
import { notificationRowsFromQuery } from '@/app/(dashboard)/helpers/notificationActivity'
import { useI11n } from '@/i18n/useI11n'

import { useWorkerQuotes } from '../context/WorkerQuotesProvider'
import { buildWorkerQuoteActivityFallback } from '../helpers/workerQuoteActivity'
import bag from '../i11n.json'

export function WorkerQuoteActivity() {
  const t = useI11n(bag)
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
      emptyMessage={t.activityEmpty}
    />
  )
}
