'use client'

import { useI11n } from '@/i18n/useI11n'
import { Card } from '@ui'

import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import bag from '../../i11n.json'
import { TaskOverflowActions, useTaskDialogs } from '../layout/TaskOverflowMenu'

/**
 * Desktop Help & actions card: the view's booking actions, then the task
 * ones. The page header's options menu holds the same at every width.
 */
export function TaskHelpCard() {
  const t = useI11n(bag)
  const { openDialog, dialogs } = useTaskDialogs()

  return (
    <Card {...TASK_DETAIL_SECTION_CARD} eyebrow={t.actions.helpHeading}>
      <TaskOverflowActions onOpenDialog={openDialog} />
      {dialogs}
    </Card>
  )
}
