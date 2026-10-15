'use client'

import { useI11n } from '@/i18n/useI11n'
import { Card } from '@ui'

import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import bag from '../../i11n.json'
import {
  TaskOverflowActions,
  useBookingDialogs,
} from '../layout/TaskOverflowMenu'

/**
 * Desktop Help & actions card: the view's booking actions, then the task
 * ones. Compact uses the sticky title overflow.
 */
export function TaskHelpCard() {
  const t = useI11n(bag)
  const { openDialog, dialogs } = useBookingDialogs()

  return (
    <Card {...TASK_DETAIL_SECTION_CARD} eyebrow={t.actions.helpHeading}>
      <TaskOverflowActions onOpenDialog={openDialog} />
      {dialogs}
    </Card>
  )
}
