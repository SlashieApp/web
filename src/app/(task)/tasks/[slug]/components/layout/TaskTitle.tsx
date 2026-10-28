'use client'

import { Skeleton } from '@chakra-ui/react'

import { StickyHeaderTitle } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'

/** The task's title: the loaded one, else the search card's, else empty. */
export function useTaskTitle(): string {
  const { task, seed } = useTaskDetail()
  return task?.title?.trim() || seed?.title?.trim() || ''
}

/**
 * The task title, the page's one h1: under the map with the chips under it. It
 * scrolls with the page and collapses into the page header's bar (FE-458),
 * where Back and the Help & actions menu are. The status badge is the Task
 * summary's eyebrow.
 */
export function TaskTitle() {
  const { task, pending, seed } = useTaskDetail()
  const title = useTaskTitle()

  if (!task && !pending && !seed) return null

  return (
    <StickyHeaderTitle>
      {title || <Skeleton as="span" h="20px" w="55%" borderRadius="md" />}
    </StickyHeaderTitle>
  )
}
