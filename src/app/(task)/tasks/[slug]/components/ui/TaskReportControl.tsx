'use client'

import {
  ReportControl,
  type ReportControlProps,
} from '@/content/trust/ReportControl'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { taskReportSubject } from '../../helpers/taskDetailUtils'

type TaskReportControlProps = Omit<
  ReportControlProps,
  'kind' | 'targetId' | 'targetTitle' | 'targetMeta' | 'targetImageSrc'
>

/**
 * Report control wired to the open task-detail record so the dialog can
 * show title, area, category, and photo.
 */
export function TaskReportControl(props: TaskReportControlProps) {
  const { task, seed } = useTaskDetail()
  if (!task) return null
  return (
    <ReportControl
      kind="task"
      targetId={task.id}
      {...taskReportSubject(task, seed)}
      {...props}
    />
  )
}
