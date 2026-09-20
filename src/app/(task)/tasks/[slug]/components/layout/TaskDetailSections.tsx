'use client'

import { Box, Grid, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import type { TaskDetailSectionId } from '../../helpers/taskDetailStickySections'
import { sectionFlowCss } from '../../helpers/taskDetailStickySections'
import { useTaskDetailSections } from '../../helpers/useTaskDetailSections'
import { TaskOwnerCard } from '../ui/TaskOwnerCard'
import { PhotosCard } from '../ui/openTask/PhotosCard'
import { QuotesPanel } from '../ui/openTask/QuotesPanel'
import { TaskDetailsCard } from '../ui/openTask/TaskDetailsCard'
import { TaskPricingCard } from '../ui/openTask/TaskPricingCard'
import { TrustCard } from '../ui/openTask/TrustCard'
import { TaskActivitySections } from './TaskActivitySections'
import { TaskDetailStatusCallout } from './TaskDetailMoneyChrome'
import { TaskHelpActions } from './TaskOverflowMenu'

/**
 * The two task-detail section groups, shared by both form factors as
 * Overview · Quotes tabs.
 */

/** Hide the in-flow twin when that section is the mobile pin (spacer is the view clearance). */
function SectionSlot({
  id,
  children,
  resolved,
}: {
  id: TaskDetailSectionId
  children: ReactNode
  resolved: ReturnType<typeof useTaskDetailSections>
}) {
  return <Box css={sectionFlowCss(id, resolved)}>{children}</Box>
}

export function TaskInfoSections() {
  const { task } = useTaskDetail()
  const resolved = useTaskDetailSections()
  return (
    <Stack gap={5} w="full" minW={0} pointerEvents="auto">
      <SectionSlot id="statusCallout" resolved={resolved}>
        <TaskDetailStatusCallout />
      </SectionSlot>
      <Grid
        templateColumns={{
          base: '1fr',
          lg: 'minmax(0, 1.85fr) minmax(280px, 1fr)',
        }}
        gap={6}
        alignItems="start"
      >
        <Stack gap={5} minW={0}>
          <SectionSlot id="pricing" resolved={resolved}>
            <TaskPricingCard />
          </SectionSlot>
          <SectionSlot id="details" resolved={resolved}>
            <TaskDetailsCard />
          </SectionSlot>
          <SectionSlot id="photos" resolved={resolved}>
            <PhotosCard />
          </SectionSlot>
        </Stack>
        <Stack gap={5} minW={0}>
          <SectionSlot id="help" resolved={resolved}>
            <TaskHelpActions />
          </SectionSlot>
          <SectionSlot id="activity" resolved={resolved}>
            <TaskActivitySections />
          </SectionSlot>
          <SectionSlot id="owner" resolved={resolved}>
            <TaskOwnerCard />
          </SectionSlot>
        </Stack>
      </Grid>
      {task ? (
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
