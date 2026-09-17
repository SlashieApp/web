'use client'

import { Box } from '@chakra-ui/react'

import {
  PAGE_CONTAINER_MAX_W,
  PAGE_CONTAINER_MAX_W_CSS,
  PAGE_GUTTER_X,
} from '@/theme/pageContainer'

import { TASK_DETAIL_DESKTOP_MAP_SPACER } from '../../../helpers/taskDetailLayout'
import { StatusHeader } from '../StatusHeader'
import {
  TASK_DETAIL_CTA_CLEARANCE,
  TaskDetailCtaBar,
} from '../TaskDetailCtaBar'
import { TaskDetailSectionTabs } from '../TaskDetailSectionTabs'
import { TaskBackButton } from '../TaskHeaderControls'
import { TaskDetailMapBackground } from './TaskDetailMapBackground'

/** Pull the full money chrome + tabs onto the hero (chrome is ~9rem). */
const MOBILE_MAP_CHROME_OVERLAP = '-9.25rem'

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
    <>
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
            position="sticky"
            top={3}
            zIndex={6}
            h="44px"
            mb="-44px"
            pointerEvents="none"
          >
            <Box
              w="full"
              maxW={PAGE_CONTAINER_MAX_W}
              mx="auto"
              px={PAGE_GUTTER_X}
            >
              <Box pointerEvents="auto" w="fit-content">
                <TaskBackButton overlay />
              </Box>
            </Box>
          </Box>
          <Box
            display={{ base: 'none', lg: 'block' }}
            h={TASK_DETAIL_DESKTOP_MAP_SPACER}
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
              <TaskDetailSectionTabs fittedBelowLg px={{ base: 4, lg: 0 }} />
              <Box
                display={{ base: 'block', lg: 'none' }}
                bg="bg.canvas"
                h={TASK_DETAIL_CTA_CLEARANCE}
                aria-hidden
              />
            </Box>
          </Box>
        </Box>
      </Box>
      <TaskDetailCtaBar />
    </>
  )
}
