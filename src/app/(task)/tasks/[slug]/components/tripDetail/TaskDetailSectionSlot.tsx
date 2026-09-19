'use client'

import { Box } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import type { TaskDetailSectionId } from '../../helpers/taskDetailSectionRegistry'
import { useTaskDetailSectionPlacement } from '../../helpers/useTaskDetailSectionLayout'

/**
 * Renders a task-detail section in the scroll body, or hides it on mobile
 * when that section is the bottom pin (desktop still shows it in-flow).
 */
export function TaskDetailSectionSlot({
  id,
  children,
}: {
  id: TaskDetailSectionId
  children: ReactNode
}) {
  const placement = useTaskDetailSectionPlacement(id)
  if (placement === 'hidden') return null
  if (placement === 'pin') {
    return <Box display={{ base: 'none', lg: 'contents' }}>{children}</Box>
  }
  return children
}
