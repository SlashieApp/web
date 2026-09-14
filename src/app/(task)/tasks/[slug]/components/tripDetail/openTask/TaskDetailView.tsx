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
 * Desktop (`lg+`) task detail: map background, full-width sticky title +
 * status + budget + Overview / Quotes / Activity, and a floating role CTA.
 * Overview is a two-column info | quotes grid (the pre-tabs web layout);
 * mobile keeps a single-column tab stack.
 */
export function TaskDetailView() {
  return (
    <Box position="relative" bg="bg.canvas" w="full">
      <TaskDetailMapBackground />

      <Box position="relative" zIndex={1} w="full">
        <Box h={DESKTOP_MAP_SPACER} pointerEvents="none" aria-hidden />
        <Box
          maxW={PAGE_CONTAINER_MAX_W}
          mx="auto"
          w="full"
          px={PAGE_GUTTER_X}
          pointerEvents="none"
        >
          <Box pointerEvents="auto" w="full">
            <Box pb={TASK_DETAIL_CTA_CLEARANCE} w="full">
              <TaskDetailSectionTabs splitOverview />
            </Box>
            <TaskDetailCtaBar />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
