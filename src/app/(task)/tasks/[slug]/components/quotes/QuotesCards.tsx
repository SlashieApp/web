'use client'

import { Stack } from '@chakra-ui/react'

import { QuotesPanel } from './QuotesPanel'
import { TrustCard } from './TrustCard'

/** Quotes tab cards — quote list plus trust / report. */
export function QuotesCards() {
  return (
    <Stack gap={5} w="full" minW={0} pointerEvents="auto">
      <QuotesPanel />
      <TrustCard />
    </Stack>
  )
}
