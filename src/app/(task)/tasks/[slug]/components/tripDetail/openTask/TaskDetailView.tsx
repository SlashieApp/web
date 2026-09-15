'use client'

import { Box } from '@chakra-ui/react'

import {
  PAGE_CONTAINER_MAX_W,
  PAGE_CONTAINER_MAX_W_CSS,
  PAGE_GUTTER_X,
} from '@/theme/pageContainer'

import { StatusHeader } from '../StatusHeader'
import {
  TASK_DETAIL_CTA_CLEARANCE,
  TaskDetailCtaBar,
} from '../TaskDetailCtaBar'
import { TaskDetailSectionTabs } from '../TaskDetailSectionTabs'
import { TaskDetailMapBackground } from './TaskDetailMapBackground'

/** Map show-through above the sticky money chrome on desktop. */
const DESKTOP_MAP_SPACER = { base: '56px', md: '120px' } as const

/** Pull mobile chrome onto the hero so the map shows through at rest. */
const MOBILE_MAP_CHROME_OVERLAP = '-4.5rem'

/**
 * Responsive task detail: one tree for both form factors (avoids the SSR
 * mobile snapshot that left desktop on a phone-width shell).
 *
 * `<lg`: map hero, fitted-style sticky chrome, floating CTA.
 * `lg+`: full page column (`sizes.page` / 90rem) over the map background —
 * never the search-list column width.
 */
export function TaskDetailView() {
  return (
    <Box
      position="relative"
      bg="transparent"
      w="full"
      minW={0}
      css={{ viewTransitionName: 'task-detail-page' }}
    >
      <Box
        display={{ base: 'block', lg: 'none' }}
        position="sticky"
        top={0}
        zIndex={0}
        w="full"
      >
        <StatusHeader />
      </Box>
      <TaskDetailMapBackground />

      <Box
        position="relative"
        zIndex={1}
        w="full"
        minW={0}
        mt={{ base: MOBILE_MAP_CHROME_OVERLAP, lg: 0 }}
      >
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
          px={{ base: 0, lg: PAGE_GUTTER_X.lg }}
          pointerEvents="none"
          css={{
            width: '100%',
            maxWidth: PAGE_CONTAINER_MAX_W_CSS,
          }}
        >
          <Box pointerEvents="auto" w="full" minW={0}>
            <Box w="full">
              <TaskDetailSectionTabs fittedBelowLg px={{ base: 4, lg: 0 }} />
              <Box
                bg={{ base: 'bg.canvas', lg: 'transparent' }}
                h={TASK_DETAIL_CTA_CLEARANCE}
                aria-hidden
              />
            </Box>
            <TaskDetailCtaBar />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
