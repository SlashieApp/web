'use client'

import { Box } from '@chakra-ui/react'

import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'

import { StatusHeader } from '../StatusHeader'
import {
  TASK_DETAIL_CTA_CLEARANCE,
  TaskDetailCtaBar,
} from '../TaskDetailCtaBar'
import { TaskDetailSectionTabs } from '../TaskDetailSectionTabs'
import { TaskDetailMapBackground } from './TaskDetailMapBackground'

/** Map show-through above the sticky money chrome on desktop. */
const DESKTOP_MAP_SPACER = { base: '56px', md: '120px' } as const

/**
 * Responsive task detail: one tree for both form factors (avoids the SSR
 * mobile snapshot that left desktop on a phone-width shell).
 *
 * `<lg`: map hero, fitted-style sticky chrome, floating CTA.
 * `lg+`: full-width page column over the map background (not a 460px list
 * shell).
 */
export function TaskDetailView() {
  return (
    <Box position="relative" bg="bg.canvas" w="full" minW={0}>
      <Box display={{ base: 'block', lg: 'none' }}>
        <StatusHeader />
      </Box>
      <TaskDetailMapBackground />

      <Box position="relative" zIndex={1} w="full" minW={0}>
        <Box
          display={{ base: 'none', lg: 'block' }}
          h={DESKTOP_MAP_SPACER}
          pointerEvents="none"
          aria-hidden
        />
        <Box
          w="full"
          maxW={PAGE_CONTAINER_MAX_W}
          mx="auto"
          px={{ base: 0, lg: PAGE_GUTTER_X }}
          pointerEvents="none"
        >
          <Box pointerEvents="auto" w="full" minW={0}>
            <Box pb={TASK_DETAIL_CTA_CLEARANCE}>
              <TaskDetailSectionTabs fittedBelowLg px={{ base: 4, lg: 0 }} />
            </Box>
            <TaskDetailCtaBar />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
