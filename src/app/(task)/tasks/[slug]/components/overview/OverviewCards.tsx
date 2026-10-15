'use client'

import { Stack } from '@chakra-ui/react'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { showTaskDetailQuotesSection } from '../../helpers/taskDetailTabs'
import { TaskAnalyticsTrigger } from '../analytics/AnalyticsCards'
import { staggerChildrenCss } from '../layout/Reveal'
import { TaskActivityTrigger } from '../layout/TaskActivityTrigger'
import { QuotesPanel } from '../quotes/QuotesPanel'
import { TaskSummary } from '../summary/TaskSummary'
import { PhotosCard } from './PhotosCard'

/**
 * Overview: the Task summary (status, booking, budget and details in one
 * card, FE-274), photos, then quotes as a section. Phones also get the
 * Analytics (owner) and Activity section cards, which open bottom sheets;
 * web shows both open in the rail.
 */
export function OverviewCards() {
  const { permissions } = useTaskDetail()

  return (
    <Stack gap={5} minW={0} w="full" css={staggerChildrenCss}>
      <TaskSummary />
      <PhotosCard />
      <TaskAnalyticsTrigger />
      <TaskActivityTrigger />
      {showTaskDetailQuotesSection(permissions) ? <QuotesPanel /> : null}
    </Stack>
  )
}
