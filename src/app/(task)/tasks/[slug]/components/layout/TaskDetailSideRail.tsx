'use client'

import { Stack } from '@chakra-ui/react'

import { AnalyticsCards } from '../analytics/AnalyticsCards'
import { TaskActivityCard } from '../overview/TaskActivityLog'
import { TaskHelpCard } from '../overview/TaskHelpCard'
import { staggerChildrenCss } from './Reveal'

/**
 * Desktop task-detail rail: Help & actions, the owner's Analytics card, then
 * the Activity log. The rail scrolls with the page; only the chrome stays
 * sticky.
 */
export function TaskDetailSideRail() {
  return (
    <Stack gap={5} w="full" minW={0} css={staggerChildrenCss}>
      <TaskHelpCard />
      <AnalyticsCards />
      <TaskActivityCard />
    </Stack>
  )
}
