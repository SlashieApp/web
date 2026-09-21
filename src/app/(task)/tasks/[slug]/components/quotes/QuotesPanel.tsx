'use client'

import { Skeleton, Stack } from '@chakra-ui/react'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { QuotesModule } from './QuotesModule'

export function QuotesPanelSkeleton() {
  return (
    <Stack gap={4} w="full" aria-busy>
      <Skeleton h={{ base: '280px', lg: '188px' }} w="full" borderRadius="lg" />
      <Skeleton h={{ base: '280px', lg: '188px' }} w="full" borderRadius="lg" />
    </Stack>
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
