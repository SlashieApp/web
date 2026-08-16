'use client'

import { Box, Grid } from '@chakra-ui/react'
import { useRef } from 'react'

import {
  TaskDetailHeaderCollapsedProvider,
  useScrollContainerCollapsed,
} from '../../../helpers/taskDetailHeaderCollapse'
import { TaskInfoSections, TaskQuoteSections } from '../TaskDetailSections'
import {
  OPEN_TASK_HEADER_SCROLL_RESERVE,
  OpenTaskHeader,
} from './OpenTaskHeader'
import { TaskDetailMapBackground } from './TaskDetailMapBackground'

/**
 * Single desktop layout for a task detail, used for EVERY status (open, awarded
 * "job in progress", closed, cancelled). Each section branches on `permissions`
 * internally; `StatePanel` swaps the primary content per state. Desktop-only —
 * mobile is handled by `TaskDetailMobile`.
 */
export function TaskDetailView() {
  // Sticky snap collapse, driven by the app-shell content pane (the window
  // never scrolls in the (task) layout): compact as soon as scrolling starts,
  // expand only back at the very top.
  const rootRef = useRef<HTMLDivElement>(null)
  const collapsed = useScrollContainerCollapsed(rootRef, 2, 0)

  return (
    <TaskDetailHeaderCollapsedProvider value={collapsed}>
      <Box
        ref={rootRef}
        position="relative"
        // Desktop reserves the expanded header's height at the bottom so
        // collapsing the header never removes scrollable room mid-gesture
        // (without it, short pages clamp scrollTop back and the header
        // oscillates / scrolling feels stuck).
        pb={{ base: 28, md: 16, lg: OPEN_TASK_HEADER_SCROLL_RESERVE }}
        bg="bg.canvas"
      >
        {/* Fixed map — no document flow height. */}
        <TaskDetailMapBackground />

        <Box position="relative" zIndex={1}>
          <OpenTaskHeader />

          <Box
            maxW="6xl"
            mx="auto"
            px={{ base: 4, md: 6 }}
            pb={{ base: 4, md: 0 }}
            pointerEvents="none"
          >
            <Grid
              templateColumns={{
                base: '1fr',
                lg: 'minmax(0, 1fr) minmax(320px, 400px)',
              }}
              columnGap={{ lg: 8 }}
              rowGap={5}
              alignItems="start"
            >
              {/* Left column = mobile Info tab; right = mobile Quotes tab. */}
              <TaskInfoSections />
              <TaskQuoteSections />
            </Grid>
          </Box>
        </Box>
      </Box>
    </TaskDetailHeaderCollapsedProvider>
  )
}
