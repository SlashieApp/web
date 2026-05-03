'use client'

import { Stack, type StackProps } from '@chakra-ui/react'

import { OwnerHelpCard } from './OwnerHelpCard'
import { OwnerPerformanceCard } from './OwnerPerformanceCard'
import { OwnerToolbar } from './OwnerToolbar'
import { PaymentTrustCard } from './PaymentTrustCard'
import { TaskQuotesSection } from './TaskQuotesSection'

export function TaskActionSection(props: StackProps) {
  return (
    <Stack gap={4} w="full" {...props}>
      <OwnerToolbar />
      <TaskQuotesSection />
      <PaymentTrustCard />
      <OwnerPerformanceCard />
      <OwnerHelpCard />
    </Stack>
  )
}
