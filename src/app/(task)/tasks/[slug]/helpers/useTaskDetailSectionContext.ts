'use client'

import { useTaskDetail } from '../context/TaskDetailProvider'
import type { TaskDetailSectionContext } from './taskDetailSections'

/** Map live task-detail context onto the section registry input. */
export function useTaskDetailSectionContext(): TaskDetailSectionContext {
  const { task, permissions, statusReady, pending } = useTaskDetail()
  return {
    permissions,
    quoteCount: task?.quotes.length ?? 0,
    hasTask: Boolean(task),
    statusReady,
    pending,
  }
}
