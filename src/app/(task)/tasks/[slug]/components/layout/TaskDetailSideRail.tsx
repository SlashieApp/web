'use client'

import { Stack } from '@chakra-ui/react'

import { AnalyticsCards } from '../analytics/AnalyticsCards'
import { useShowPricingCard } from '../overview/OverviewCards'
import { TaskActivitySections } from '../overview/TaskActivitySections'
import { TaskHelpCard } from '../overview/TaskHelpCard'
import { TaskPricingCard } from '../overview/TaskPricingCard'
import { staggerChildrenCss } from './Reveal'

/**
 * Desktop task-detail rail: the Pricing hero, the owner's Analytics card,
 * then Help & actions and Activity. The rail scrolls with the page; only the
 * chrome stays sticky.
 */
export function TaskDetailSideRail() {
  const showPricing = useShowPricingCard()
  return (
    <Stack gap={5} w="full" minW={0} css={staggerChildrenCss}>
      {showPricing ? <TaskPricingCard /> : null}
      <AnalyticsCards />
      <TaskHelpCard />
      <TaskActivitySections />
    </Stack>
  )
}
