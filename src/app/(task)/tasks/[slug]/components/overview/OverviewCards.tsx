'use client'

import { Box, Stack } from '@chakra-ui/react'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import type { TaskDetailOverviewCardId } from '../../helpers/taskDetailMainCtaModel'
import { showTaskDetailQuotesSection } from '../../helpers/taskDetailTabs'
import { TaskAnalyticsTrigger } from '../analytics/AnalyticsCards'
import { staggerChildrenCss } from '../layout/Reveal'
import { QuotesPanel } from '../quotes/QuotesPanel'
import { BookingSection } from './BookingSection'
import { PhotosCard } from './PhotosCard'
import { TaskDetailsCard } from './TaskDetailsCard'
import { TaskPricingCard } from './TaskPricingCard'

/**
 * Overview cards. A card stays hidden when the main CTA already shows it.
 * The poster is a row in Task details, not its own card, and quotes are a
 * section here instead of a tab. Owners get an Analytics button (phones)
 * that opens the rail card's snapshot in a sheet (FE-258).
 */
/**
 * Pricing shows unless the main CTA already carries it, or the job is booked
 * or done. Phones keep it in Overview; desktop puts it at the top of the rail.
 */
export function useShowPricingCard(): boolean {
  const { mainCta, permissions } = useTaskDetail()
  const hidden = new Set<TaskDetailOverviewCardId>(
    mainCta?.hideOverviewCards ?? [],
  )
  const hidePrice =
    hidden.has('pricing') ||
    permissions.isAwarded ||
    permissions.isJobCompleted ||
    (permissions.isClosed && !permissions.isCancelled)
  return !hidePrice
}

export function OverviewCards() {
  const { permissions } = useTaskDetail()
  const showPricing = useShowPricingCard()

  return (
    <Stack gap={5} minW={0} w="full" css={staggerChildrenCss}>
      <BookingSection />
      {showPricing ? (
        <Box display={{ base: 'block', lg: 'none' }}>
          <TaskPricingCard />
        </Box>
      ) : null}
      <TaskDetailsCard />
      <PhotosCard />
      <TaskAnalyticsTrigger />
      {showTaskDetailQuotesSection(permissions) ? <QuotesPanel /> : null}
    </Stack>
  )
}
