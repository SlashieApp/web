'use client'

import { Stack } from '@chakra-ui/react'

import { TaskActivitySections } from '../overview/TaskActivitySections'
import { TaskHelpCard } from '../overview/TaskHelpCard'

/**
 * Desktop task-detail rail: Help & actions and Activity sit outside the tab
 * body so they stay visible on every tab. The rail scrolls with the page —
 * only the tab chrome stays sticky.
 */
export function TaskDetailSideRail() {
  return (
    <Stack gap={5} w="full" minW={0}>
      <TaskHelpCard />
      <TaskActivitySections />
    </Stack>
  )
}
