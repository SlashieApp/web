'use client'

import { Box } from '@chakra-ui/react'

import { PAGE_GUTTER_X } from '@/theme/pageContainer'

import {
  TASK_DETAIL_COLUMN_MAX_W,
  TASK_DETAIL_DESKTOP_MAP_PEEK,
} from '../../../helpers/taskDetailLayout'
import { StatusHeader } from '../StatusHeader'
import {
  TASK_DETAIL_CTA_CLEARANCE,
  TaskDetailCtaBar,
} from '../TaskDetailCtaBar'
import { TaskDetailSectionTabs } from '../TaskDetailSectionTabs'
import { TaskDetailMapBackground } from './TaskDetailMapBackground'

/**
 * Responsive task detail: one CSS tree for both form factors (no JS
 * `matchMedia` split — that SSR-painted the mobile shell on desktop).
 *
 * `<lg`: map hero, fitted sticky chrome, floating CTA.
 * `lg+`: full page-container column (`90rem`, not the 460px search list)
 * over the map, with a map peek above sticky money chrome.
 */
export function TaskDetailView() {
  return (
    <Box
      position="relative"
      bg={{ base: 'bg.canvas', lg: 'transparent' }}
      w="full"
      minW={0}
    >
      <Box display={{ base: 'block', lg: 'none' }}>
        <StatusHeader />
      </Box>
      <TaskDetailMapBackground />

      <Box position="relative" zIndex={1} w="full" minW={0}>
        <Box
          display={{ base: 'none', lg: 'block' }}
          h={TASK_DETAIL_DESKTOP_MAP_PEEK}
          pointerEvents="none"
          aria-hidden
        />
        <Box
          w="full"
          maxW={TASK_DETAIL_COLUMN_MAX_W}
          mx="auto"
          px={{ base: 0, lg: PAGE_GUTTER_X }}
          pointerEvents="none"
          css={{ width: '100%', maxWidth: TASK_DETAIL_COLUMN_MAX_W }}
        >
          <Box pointerEvents="auto" w="full" minW={0} bg="bg.canvas">
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
