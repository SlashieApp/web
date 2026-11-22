'use client'

import { Skeleton } from '@chakra-ui/react'

import { StickyHeaderTitle } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_VIEWS } from '../../views'
import { TaskStatusPill } from '../ui/TaskStatusPill'

/** The task's title: the loaded one, else the search card's, else empty. */
export function useTaskTitle(): string {
  const { task, seed } = useTaskDetail()
  return task?.title?.trim() || seed?.title?.trim() || ''
}

/**
 * The task title, the page's one h1: under the map, with a line under it. It
 * scrolls with the page and collapses into the page header's bar (FE-458),
 * where Back and the Help & actions menu are. The header clamps it to 3 lines
 * (`TASK_TITLE_MAX_LINES`): a longer title is a toggle in the heading that
 * shows all of it (FE-465).
 *
 * The task's status pill follows the title on the same line (Ryan 22 Nov; it
 * was the Task summary's eyebrow). It shows once the task has loaded: the
 * search card's title alone does not say where the task stands.
 */
export function TaskTitle() {
  const { task, pending, seed, view } = useTaskDetail()
  const title = useTaskTitle()

  if (!task && !pending && !seed) return null

  const pill = task ? TASK_DETAIL_VIEWS[view].pill : null

  return (
    <StickyHeaderTitle
      after={pill ? <TaskStatusPill status={pill} size="sm" /> : undefined}
    >
      {title || <Skeleton as="span" h="20px" w="55%" borderRadius="md" />}
    </StickyHeaderTitle>
  )
}
