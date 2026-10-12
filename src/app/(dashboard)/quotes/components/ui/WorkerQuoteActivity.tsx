'use client'

import { useMemo } from 'react'

import { InboxActivityPanel } from '@/app/(dashboard)/components/ui/inbox/InboxActivityPanel'
import { useI11n } from '@/i18n/useI11n'

import { useWorkerQuotes } from '../../context/WorkerQuotesProvider'
import { buildWorkerQuoteActivityFallback } from '../../helpers/workerQuoteActivity'
import bag from '../../i11n.json'

export function WorkerQuoteActivity() {
  const t = useI11n(bag)
  const { quoteRows } = useWorkerQuotes()

  const rows = useMemo(() => {
    return buildWorkerQuoteActivityFallback(quoteRows)
  }, [quoteRows])

  return <InboxActivityPanel rows={rows} emptyMessage={t.activityEmpty} />
}
