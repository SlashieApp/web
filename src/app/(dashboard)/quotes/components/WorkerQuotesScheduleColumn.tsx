'use client'

import { Stack } from '@chakra-ui/react'

import { WorkerQuoteCalendar } from './WorkerQuoteCalendar'
import { WorkerQuoteUpcoming } from './WorkerQuoteUpcoming'

export function WorkerQuotesScheduleColumn() {
  return (
    <Stack
      gap={4}
      position={{ xl: 'sticky' }}
      top={{ xl: 6 }}
      alignSelf="start"
      w="full"
      minW={0}
    >
      <WorkerQuoteCalendar />
      <WorkerQuoteUpcoming />
    </Stack>
  )
}
