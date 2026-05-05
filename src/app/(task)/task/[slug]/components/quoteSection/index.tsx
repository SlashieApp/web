'use client'

import { Stack, type StackProps } from '@chakra-ui/react'

import { QuotePaymentTrustCard } from './QuotePaymentTrustCard'
import { QuotesSection } from './QuotesSection'

export function QuoteSection(props: StackProps) {
  return (
    <Stack id="task-quote" scrollMarginTop="96px" gap={4} w="full" {...props}>
      <QuotesSection />
      <QuotePaymentTrustCard />
    </Stack>
  )
}
