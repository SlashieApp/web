'use client'

import { Box } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { PAGE_GUTTER_X } from '@/theme/pageContainer'
import { PageContainer, StickyHeader } from '@ui'

import {
  TASK_DETAIL_DESKTOP_MAP_SPACER,
  TASK_TITLE_MAX_LINES,
} from '../../helpers/taskDetailLayout'
import { TASK_DETAIL_PIN_CLEARANCE } from '../../helpers/taskDetailPinClearance'
import { useTaskBack } from '../../helpers/useTaskBack'
import bag from '../../i11n.json'
import { Reveal } from './Reveal'
import { StatusHeader } from './StatusHeader'
import { TaskDetailMapBinder } from './TaskDetailMapBinder'
import { TaskDetailMapPill } from './TaskDetailMapPill'
import { TaskDetailTabs } from './TaskDetailTabs'
import { TaskHelpOverflowTrigger } from './TaskOverflowMenu'
import { useTaskTitle } from './TaskTitle'

/** Pull the full money chrome + tabs onto the hero (chrome is ~9rem). */
const MOBILE_MAP_CHROME_OVERLAP = '-9.25rem'

/**
 * The tabs' own gutters below lg (the page gutters), where the body runs
 * edge to edge; from lg the page container brings them.
 */
const TABS_GUTTER_X = {
  base: PAGE_GUTTER_X.base,
  md: PAGE_GUTTER_X.md,
  lg: 0,
} as const

/**
 * Responsive task detail: one tree for both form factors (avoids the SSR
 * mobile snapshot that left desktop on a phone-width shell).
 *
 * The page header's bar (FE-458) floats over the map at every width, with Back
 * and the options menu in it; the task title stays under the map and
 * collapses into the bar as the page scrolls. A long title shows 3 lines and
 * opens on a tap (FE-465).
 *
 * `<lg`: map hero, fitted-style sticky chrome, role-aware bottom pin.
 * `lg+`: full page container (`sizes.page`, 80rem) over the map background,
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
      contained
      titleMaxLines={TASK_TITLE_MAX_LINES}
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
          <TaskDetailMapPill />
          <Box
            display={{ base: 'none', lg: 'block' }}
            h={TASK_DETAIL_DESKTOP_MAP_SPACER}
            pointerEvents="none"
            aria-hidden
          />
          <PageContainer gutters="lg" pointerEvents="none">
            <Box pointerEvents="auto" w="full" minW={0}>
              <Reveal>
                <TaskDetailTabs fittedBelowLg px={TABS_GUTTER_X} />
              </Reveal>
            </Box>
          </PageContainer>
          <Box pointerEvents="auto">
            <Box
              display={{ base: 'block', lg: 'none' }}
              bg="bg.canvas"
              h={TASK_DETAIL_PIN_CLEARANCE}
              aria-hidden
            />
          </Box>
        </Box>
      </Box>
    </StickyHeader>
  )
}
