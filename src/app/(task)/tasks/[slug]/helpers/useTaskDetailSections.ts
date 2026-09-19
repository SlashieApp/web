'use client'

import { useTaskDetail } from '../context/TaskDetailProvider'
import { resolveTaskDetailSections } from './taskDetailStickySections'

/** Role + task-state placement for every overview section. */
export function useTaskDetailSections() {
  const { task, pending, permissions, isAuthenticated } = useTaskDetail()
  return resolveTaskDetailSections({
    hasTask: Boolean(task),
    pending,
    permissions,
    isAuthenticated,
    quoteCount: task?.quotes.length ?? 0,
  })
}
