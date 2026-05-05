'use client'

import { Stack, type StackProps } from '@chakra-ui/react'

import { QuoteOwnerHelpCard } from './QuoteOwnerHelpCard'
import { QuoteOwnerPerformanceCard } from './QuoteOwnerPerformanceCard'
import { QuoteOwnerToolbar } from './QuoteOwnerToolbar'
import { QuotePaymentTrustCard } from './QuotePaymentTrustCard'
import { QuotesSection } from './QuotesSection'

export function QuoteSection(props: StackProps) {
  return (
    <Stack gap={4} w="full" {...props}>
      <QuoteOwnerToolbar />
      <QuotesSection />
      <QuotePaymentTrustCard />
      <QuoteOwnerPerformanceCard />
      <QuoteOwnerHelpCard />
    </Stack>
  )
}
