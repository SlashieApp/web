'use client'

import { Box } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import {
  PAGE_CONTAINER_MAX_W,
  PAGE_CONTAINER_MAX_W_CSS,
  PAGE_GUTTER_X,
} from '@/theme/pageContainer'
import { StickyHeader } from '@ui'

import { TASK_DETAIL_DESKTOP_MAP_SPACER } from '../../helpers/taskDetailLayout'
import { TASK_DETAIL_PIN_CLEARANCE } from '../../helpers/taskDetailPinClearance'
import { useTaskBack } from '../../helpers/useTaskBack'
import bag from '../../i11n.json'
import { Reveal } from './Reveal'
import { StatusHeader } from './StatusHeader'
import { TaskDetailMapBinder } from './TaskDetailMapBinder'
import { TaskDetailTabs } from './TaskDetailTabs'
import { TaskHelpOverflowTrigger } from './TaskOverflowMenu'
import { useTaskTitle } from './TaskTitle'

/** Pull the full money chrome + tabs onto the hero (chrome is ~9rem). */
const MOBILE_MAP_CHROME_OVERLAP = '-9.25rem'

/** The body's gutters (the tabs, from lg the page column): the bar's row lines up with them. */
const BODY_GUTTER_X = { base: 4, lg: PAGE_GUTTER_X.lg } as const

/**
 * Responsive task detail: one tree for both form factors (avoids the SSR
 * mobile snapshot that left desktop on a phone-width shell).
 *
 * The page header's bar (FE-458) floats over the map at every width, with Back
 * and the options menu in it; the task title stays under the map and
 * collapses into the bar as the page scrolls.
 *
 * `<lg`: map hero, fitted-style sticky chrome, role-aware bottom pin.
 * `lg+`: full page column (`sizes.page` / 90rem) over the map background —
 * never the search-list column width.
 */
export function TaskDetailView() {
  const t = useI11n(bag)
  const onBack = useTaskBack()
  const title = useTaskTitle()

  return (
    <StickyHeader
      overMedia
      background="bg.canvas"
      title={title}
      onBack={onBack}
      backAriaLabel={t.nav.goBackAria}
      option={<TaskHelpOverflowTrigger overlay />}
      contentMaxW={PAGE_CONTAINER_MAX_W}
      contentPx={BODY_GUTTER_X}
    >
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
    </StickyHeader>
  )
}
