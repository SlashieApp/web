'use client'

import { Box, Grid, Stack } from '@chakra-ui/react'

import { SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  isTaskDetailSectionInFlow,
  resolveTaskDetailOverviewPlacement,
} from '../../helpers/taskDetailSectionRegistry'
import { useTaskDetailSectionContext } from '../../helpers/useTaskDetailSectionContext'
import { TaskOwnerCard } from '../TaskOwnerCard'
import { TaskActivitySections } from './TaskActivitySections'
import { TaskDetailStatusCallout } from './TaskDetailMoneyChrome'
import { TaskHelpActions } from './TaskOverflowMenu'
import { PhotosCard } from './openTask/PhotosCard'
import { QuotesPanel } from './openTask/QuotesPanel'
import { TaskDetailsCard } from './openTask/TaskDetailsCard'
import { TaskPricingCard } from './openTask/TaskPricingCard'
import { TrustCard } from './openTask/TrustCard'

function FlowSlot({
  id,
  stickyId,
  children,
}: {
  id: Parameters<typeof isTaskDetailSectionInFlow>[0]
  stickyId: ReturnType<typeof resolveTaskDetailOverviewPlacement>['stickyId']
  children: React.ReactNode
}) {
  const hideOnMobile = stickyId === id
  return (
    <Box
      display={hideOnMobile ? { base: 'none', lg: 'block' } : undefined}
      w="full"
    >
      {children}
    </Box>
  )
}

/**
 * The two task-detail section groups, shared by both form factors as
 * Overview · Quotes tabs. Visibility comes from the section registry
 * (`showInFlow` / `canPinMobile` / `stickyPriority`) — not ad-hoc JSX.
 */

export function TaskInfoSections() {
  const { task } = useTaskDetail()
  const ctx = useTaskDetailSectionContext()
  const placement = resolveTaskDetailOverviewPlacement(ctx)
  const inFlow = (id: Parameters<typeof isTaskDetailSectionInFlow>[0]) =>
    isTaskDetailSectionInFlow(id, placement)

  return (
    <Stack gap={5} w="full" minW={0} pointerEvents="auto">
      {inFlow('statusCallout') ? <TaskDetailStatusCallout /> : null}
      <Grid
        templateColumns={{
          base: '1fr',
          lg: 'minmax(0, 1.85fr) minmax(280px, 1fr)',
        }}
        gap={6}
        alignItems="start"
      >
        <Stack gap={5} minW={0}>
          {inFlow('pricingQuote') ? (
            <FlowSlot id="pricingQuote" stickyId={placement.stickyId}>
              <TaskPricingCard />
            </FlowSlot>
          ) : null}
          {inFlow('details') ? <TaskDetailsCard /> : null}
          {inFlow('photos') ? <PhotosCard /> : null}
        </Stack>
        <Stack gap={5} minW={0}>
          {inFlow('helpActions') ? <TaskHelpActions /> : null}
          {inFlow('activity') ? <TaskActivitySections /> : null}
          {inFlow('owner') ? (
            <FlowSlot id="owner" stickyId={placement.stickyId}>
              <TaskOwnerCard />
            </FlowSlot>
          ) : null}
        </Stack>
      </Grid>
      {inFlow('safetyNotice') && task ? (
        <Box display={{ base: 'none', lg: 'block' }}>
          <SafetyNotice variant="inline" />
        </Box>
      ) : null}
    </Stack>
  )
}

export function TaskQuoteSections() {
  return (
    <Stack gap={5} w="full" minW={0} pointerEvents="auto">
      <QuotesPanel />
      <TrustCard />
    </Stack>
  )
}
