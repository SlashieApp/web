'use client'

import { Box } from '@chakra-ui/react'

import {
  PAGE_CONTAINER_MAX_W,
  PAGE_CONTAINER_MAX_W_CSS,
  PAGE_GUTTER_X,
} from '@/theme/pageContainer'

import { TASK_DETAIL_STUCK_ROW_TOP } from '../../helpers/taskDetailHeaderCollapse'
import { TASK_DETAIL_DESKTOP_MAP_SPACER } from '../../helpers/taskDetailLayout'
import { TASK_DETAIL_PIN_CLEARANCE } from '../../helpers/taskDetailPinClearance'
import { Reveal } from './Reveal'
import { StatusHeader } from './StatusHeader'
import { TaskDetailMapBinder } from './TaskDetailMapBinder'
import { TaskDetailTabs } from './TaskDetailTabs'
import { TaskBackButton } from './TaskHeaderControls'

/** Pull the full money chrome + tabs onto the hero (chrome is ~9rem). */
const MOBILE_MAP_CHROME_OVERLAP = '-9.25rem'

/**
 * Responsive task detail: one tree for both form factors (avoids the SSR
 * mobile snapshot that left desktop on a phone-width shell).
 *
 * `<lg`: map hero, fitted-style sticky chrome, role-aware bottom pin.
 * `lg+`: full page column (`sizes.page` / 90rem) over the map background —
 * never the search-list column width.
 */
export function TaskDetailView() {
  return (
    <Box position="relative" bg="transparent" w="full" minW={0}>
      <Box
        display={{ base: 'block', lg: 'none' }}
        position="sticky"
        top={0}
        zIndex={0}
        w="full"
      >
        <StatusHeader />
      </Box>
      <TaskDetailMapBinder />

      <Box
        position="relative"
        zIndex={1}
        w="full"
        minW={0}
        mt={{ base: MOBILE_MAP_CHROME_OVERLAP, lg: 0 }}
      >
        {/* Pinned at the docked title row's top, so the two line up. */}
        <Box
          display={{ base: 'none', lg: 'block' }}
          position="sticky"
          top={TASK_DETAIL_STUCK_ROW_TOP}
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
            <Reveal>
              <TaskDetailTabs fittedBelowLg px={{ base: 4, lg: 0 }} />
            </Reveal>
          </Box>
        </Box>
        <Box pointerEvents="auto">
          <Box
            display={{ base: 'block', lg: 'none' }}
            bg="status.success.soft"
            h={TASK_DETAIL_PIN_CLEARANCE}
            aria-hidden
          />
        </Box>
      </Box>
    </Box>
  )
}
