'use client'

import { Box, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import type { TaskDetailSectionId } from '../../helpers/taskDetailStickySections'
import { sectionFlowCss } from '../../helpers/taskDetailStickySections'
import { useTaskDetailSections } from '../../helpers/useTaskDetailSections'
import { PhotosCard } from './PhotosCard'
import { TaskDetailsCard } from './TaskDetailsCard'
import { TaskOwnerCard } from './TaskOwnerCard'
import { TaskPricingCard } from './TaskPricingCard'

/** Hide the in-flow twin when that section is the mobile pin or the web rail CTA. */
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

/** Overview tab cards — pricing, details, photos, owner. */
export function OverviewCards() {
  const resolved = useTaskDetailSections()
  return (
    <Stack gap={5} minW={0} w="full">
      <SectionSlot id="pricing" resolved={resolved}>
        <TaskPricingCard />
      </SectionSlot>
      <SectionSlot id="details" resolved={resolved}>
        <TaskDetailsCard />
      </SectionSlot>
      <SectionSlot id="photos" resolved={resolved}>
        <PhotosCard />
      </SectionSlot>
      <SectionSlot id="owner" resolved={resolved}>
        <TaskOwnerCard />
      </SectionSlot>
    </Stack>
  )
}
