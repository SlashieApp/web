'use client'

import { Stack } from '@chakra-ui/react'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import type { TaskDetailOverviewCardId } from '../../helpers/taskDetailMainCtaModel'
import { BookingSection } from './BookingSection'
import { PhotosCard } from './PhotosCard'
import { TaskDetailsCard } from './TaskDetailsCard'
import { TaskOwnerCard } from './TaskOwnerCard'
import { TaskPricingCard } from './TaskPricingCard'

/** Overview tab cards. A card stays hidden when the main CTA already shows it. */
export function OverviewCards() {
  const { mainCta, permissions } = useTaskDetail()
  const hidden = new Set<TaskDetailOverviewCardId>(
    mainCta?.hideOverviewCards ?? [],
  )
  const hidePrice =
    hidden.has('pricing') ||
    permissions.isAwarded ||
    permissions.isJobCompleted ||
    (permissions.isClosed && !permissions.isCancelled)

  return (
    <Stack gap={5} minW={0} w="full">
      <BookingSection />
      {hidePrice ? null : <TaskPricingCard />}
      <TaskDetailsCard />
      <PhotosCard />
      {hidden.has('owner') ? null : <TaskOwnerCard />}
    </Stack>
  )
}
