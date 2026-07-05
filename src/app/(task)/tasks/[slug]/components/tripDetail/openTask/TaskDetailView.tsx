'use client'

import { Box, Grid } from '@chakra-ui/react'
import { useRef } from 'react'

import {
  TaskDetailHeaderCollapsedProvider,
  useScrollContainerCollapsed,
} from '../../../helpers/taskDetailHeaderCollapse'
import { TaskInfoSections, TaskQuoteSections } from '../TaskDetailSections'
import { OpenTaskHeader } from './OpenTaskHeader'
import { TaskDetailMapBackground } from './TaskDetailMapBackground'

/**
 * Single desktop layout for a task detail, used for EVERY status (open, awarded
 * "job in progress", closed, cancelled). Each section branches on `permissions`
 * internally; `StatePanel` swaps the primary content per state. Desktop-only —
 * mobile is handled by `TaskDetailMobile`.
 */
export function TaskDetailView() {
  // Collapse is driven by the app-shell content pane resolved from this root,
  // not the window (which never scrolls in the (task) layout). Snap to compact
  // the moment scrolling starts, and only expand back at the very top
  // (scrollTop 0) — safe from oscillation thanks to overflow-anchor: none.
  const rootRef = useRef<HTMLDivElement>(null)
  const collapsed = useScrollContainerCollapsed(rootRef, 2, 0)

  return (
    <TaskDetailHeaderCollapsedProvider value={collapsed}>
      <Box
        ref={rootRef}
        position="relative"
        pb={{ base: 28, md: 16 }}
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
