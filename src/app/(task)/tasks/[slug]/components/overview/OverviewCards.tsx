'use client'

import { Box, Grid, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import type { TaskDetailSectionId } from '../../helpers/taskDetailStickySections'
import { sectionFlowCss } from '../../helpers/taskDetailStickySections'
import { useTaskDetailSections } from '../../helpers/useTaskDetailSections'
import { PhotosCard } from './PhotosCard'
import { TaskActivitySections } from './TaskActivitySections'
import { TaskDetailsCard } from './TaskDetailsCard'
import { TaskHelpCard } from './TaskHelpCard'
import { TaskOwnerCard } from './TaskOwnerCard'
import { TaskPricingCard } from './TaskPricingCard'

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

/** Overview tab cards — pricing, details, photos, help, activity, owner. */
export function OverviewCards() {
  const resolved = useTaskDetailSections()
  return (
    <>
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
            <TaskHelpCard />
          </SectionSlot>
          <SectionSlot id="activity" resolved={resolved}>
            <TaskActivitySections />
          </SectionSlot>
          <SectionSlot id="owner" resolved={resolved}>
            <TaskOwnerCard />
          </SectionSlot>
        </Stack>
      </Grid>
    </>
  )
}
