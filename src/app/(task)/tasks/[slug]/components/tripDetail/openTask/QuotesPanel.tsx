'use client'

import { Skeleton, Stack } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { Card } from '@ui'
import bag from '../../../i11n.json'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { QuotesModule } from '../../quoteSection/QuotesModule'
import { WorkerOrderVerificationPanel } from '../../quoteSection/WorkerOrderVerificationPanel'

export function QuotesPanelSkeleton() {
  const t = useI11n(bag)
  return (
    <Card layout="section" heading={t.quotes.heading} aria-busy>
      <Stack gap={3}>
        <Skeleton h="72px" w="full" borderRadius="md" />
        <Skeleton h="72px" w="full" borderRadius="md" />
      </Stack>
    </Card>
  )
}

/**
 * Quotes column content. The booked worker with an ACTIVE order sees the
 * existing job verification panel instead of the Quotes module (W9: never
 * duplicate job UI inside Quotes); every other viewer/state renders the
 * 12-state `QuotesModule`.
 */
export function QuotesPanel() {
  const { task, pending, permissions } = useTaskDetail()

  if (!task) return pending ? <QuotesPanelSkeleton /> : null

  // The booked worker completes the job (enters the customer's code) here.
  if (permissions.showCompleteWithCode) return <WorkerOrderVerificationPanel />

  return <QuotesModule />
}
