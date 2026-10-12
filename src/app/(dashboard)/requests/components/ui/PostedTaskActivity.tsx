'use client'

import { useMemo } from 'react'

import { InboxActivityPanel } from '@/app/(dashboard)/components/ui/inbox/InboxActivityPanel'
import { useI11n } from '@/i18n/useI11n'

import { useMyRequestsPage } from '../../context/MyRequestsProvider'
import { buildPostedTaskActivityFallback } from '../../helpers/postedTaskActivity'
import bag from '../../i11n.json'

export function PostedTaskActivity() {
  const t = useI11n(bag)
  const { taskRows } = useMyRequestsPage()

  const rows = useMemo(() => {
    return buildPostedTaskActivityFallback(taskRows)
  }, [taskRows])

  return <InboxActivityPanel rows={rows} emptyMessage={t.activityEmpty} />
}
