'use client'

import { Skeleton, Stack } from '@chakra-ui/react'

import { useI11n } from '@/i18n/useI11n'
import { Card } from '@ui'
import bag from '../../../i11n.json'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { QuotesModule } from '../../quoteSection/QuotesModule'

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
 * Quotes tab content. Complete-with-code lives on Activity so this tab always
 * shows the 12-state Quotes module.
 */
export function QuotesPanel() {
  const { task, pending } = useTaskDetail()

  if (!task) return pending ? <QuotesPanelSkeleton /> : null

  return <QuotesModule />
}
