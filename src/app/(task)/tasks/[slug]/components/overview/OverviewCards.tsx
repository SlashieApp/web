'use client'

import { Stack } from '@chakra-ui/react'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import type { TaskDetailOverviewCardId } from '../../helpers/taskDetailMainCtaModel'
import { showTaskDetailQuotesSection } from '../../helpers/taskDetailTabs'
import { QuotesPanel } from '../quotes/QuotesPanel'
import { BookingSection } from './BookingSection'
import { PhotosCard } from './PhotosCard'
import { TaskDetailsCard } from './TaskDetailsCard'
import { TaskPricingCard } from './TaskPricingCard'

/**
 * Overview cards. A card stays hidden when the main CTA already shows it.
 * The poster is a row in Task details, not its own card, and quotes are a
 * section here instead of a tab (FE-258).
 */
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
      {showTaskDetailQuotesSection(permissions) ? <QuotesPanel /> : null}
    </Stack>
  )
}
