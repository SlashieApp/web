'use client'

import { Box, Grid, Stack } from '@chakra-ui/react'

import { SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TaskOwnerCard } from '../TaskOwnerCard'
import { TaskActivitySections } from './TaskActivitySections'
import { TaskDetailStatusCallout } from './TaskDetailMoneyChrome'
import { TaskDetailSectionSlot } from './TaskDetailSectionSlot'
import { TaskHelpActions } from './TaskOverflowMenu'
import { PhotosCard } from './openTask/PhotosCard'
import { QuotesPanel } from './openTask/QuotesPanel'
import { TaskDetailsCard } from './openTask/TaskDetailsCard'
import { TaskPricingCard } from './openTask/TaskPricingCard'
import { TrustCard } from './openTask/TrustCard'

/**
 * The two task-detail section groups, shared by both form factors as
 * Overview · Quotes tabs.
 */

export function TaskInfoSections() {
  const { task } = useTaskDetail()
  return (
    <Stack gap={5} w="full" minW={0} pointerEvents="auto">
      <TaskDetailSectionSlot id="statusCallout">
        <TaskDetailStatusCallout />
      </TaskDetailSectionSlot>
      <Grid
        templateColumns={{
          base: '1fr',
          lg: 'minmax(0, 1.85fr) minmax(280px, 1fr)',
        }}
        gap={6}
        alignItems="start"
      >
        <Stack gap={5} minW={0}>
          <TaskDetailSectionSlot id="pricing">
            <TaskPricingCard />
          </TaskDetailSectionSlot>
          <TaskDetailSectionSlot id="details">
            <TaskDetailsCard />
          </TaskDetailSectionSlot>
          <TaskDetailSectionSlot id="photos">
            <PhotosCard />
          </TaskDetailSectionSlot>
        </Stack>
        <Stack gap={5} minW={0}>
          <TaskDetailSectionSlot id="help">
            <TaskHelpActions />
          </TaskDetailSectionSlot>
          <TaskActivitySections />
          <TaskDetailSectionSlot id="owner">
            <TaskOwnerCard />
          </TaskDetailSectionSlot>
        </Stack>
      </Grid>
      {task ? (
        <TaskDetailSectionSlot id="safety">
          <Box display={{ base: 'none', lg: 'block' }}>
            <SafetyNotice variant="inline" />
          </Box>
        </TaskDetailSectionSlot>
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
