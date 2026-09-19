'use client'

import { useTaskDetail } from '../context/TaskDetailProvider'
import type { TaskDetailSectionContext } from './taskDetailSectionRegistry'

export function useTaskDetailSectionContext(): TaskDetailSectionContext {
  const { permissions, task, pending, statusReady } = useTaskDetail()
  return {
    permissions,
    quoteCount: task?.quotes.length ?? 0,
    statusReady,
    pending,
    hasTask: Boolean(task),
  }
}
