'use client'

import { Stack } from '@chakra-ui/react'

import { AnalyticsCards } from '../analytics/AnalyticsCards'
import { TaskActivitySections } from '../overview/TaskActivitySections'
import { TaskHelpCard } from '../overview/TaskHelpCard'

/**
 * Desktop task-detail rail: the owner's Analytics card, then Help & actions
 * and Activity. The rail scrolls with the page; only the chrome stays sticky.
 */
export function TaskDetailSideRail() {
  return (
    <Stack gap={5} w="full" minW={0}>
      <AnalyticsCards />
      <TaskHelpCard />
      <TaskActivitySections />
    </Stack>
  )
}
