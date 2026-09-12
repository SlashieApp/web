'use client'

import { Box } from '@chakra-ui/react'

import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'

import {
  TASK_DETAIL_CTA_CLEARANCE,
  TaskDetailCtaBar,
} from '../TaskDetailCtaBar'
import { TaskDetailSectionTabs } from '../TaskDetailSectionTabs'
import { TaskDetailMapBackground } from './TaskDetailMapBackground'

/** Map show-through above the sticky money chrome on desktop. */
const DESKTOP_MAP_SPACER = { base: '56px', md: '120px' } as const

/**
 * Desktop task detail: map background, sticky title + status + budget +
 * Overview / Quotes / Activity, floating role CTA. Same hierarchy as mobile.
 */
export function TaskDetailView() {
  return (
    <Box position="relative" pb={TASK_DETAIL_CTA_CLEARANCE} bg="bg.canvas">
      <TaskDetailMapBackground />

      <Box position="relative" zIndex={1}>
        <Box h={DESKTOP_MAP_SPACER} pointerEvents="none" aria-hidden />
        <Box
          maxW={PAGE_CONTAINER_MAX_W}
          mx="auto"
          px={PAGE_GUTTER_X}
          pointerEvents="none"
        >
          <Box pointerEvents="auto">
            <TaskDetailSectionTabs />
            <TaskDetailCtaBar />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
