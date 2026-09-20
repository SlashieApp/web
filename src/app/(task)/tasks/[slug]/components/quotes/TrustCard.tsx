'use client'

import { useI11n } from '@/i18n/useI11n'
import { Card, SafetyNotice } from '@ui'
import bag from '../../i11n.json'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TaskReportControl } from '../ui/TaskReportControl'

/**
 * C2C pay + meet-safely panel, plus a report entry so visitors do not have to
 * hunt through Terms.
 */
export function TrustCard() {
  const { task, permissions } = useTaskDetail()
  const t = useI11n(bag)

  return (
    <Card
      layout="section"
      heading={
        permissions.isOwner ? t.trust.ownerHeading : t.trust.workerHeading
      }
    >
      <SafetyNotice variant="inline" />
      {task ? <TaskReportControl variant="button" /> : null}
    </Card>
  )
}
