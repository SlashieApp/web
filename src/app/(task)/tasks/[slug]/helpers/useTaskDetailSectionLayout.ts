'use client'

import { useMemo } from 'react'

import { useTaskDetail } from '../context/TaskDetailProvider'
import {
  type TaskDetailSectionId,
  resolveTaskDetailSectionLayout,
} from './taskDetailSectionRegistry'

export function useTaskDetailSectionLayout() {
  const { permissions, task, pending } = useTaskDetail()
  return useMemo(
    () =>
      resolveTaskDetailSectionLayout({
        permissions,
        quoteCount: task?.quotes.length ?? 0,
        pending,
        hasTask: Boolean(task),
      }),
    [permissions, pending, task],
  )
}

export function useTaskDetailSectionPlacement(id: TaskDetailSectionId) {
  const { placement } = useTaskDetailSectionLayout()
  return placement[id]
}
