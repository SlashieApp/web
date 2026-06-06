'use client'

import { Box, Grid, Stack } from '@chakra-ui/react'

import { useWorkerQuotes } from '../context/WorkerQuotesProvider'

import { WorkerQuoteFilterColumn } from './WorkerQuoteFilterColumn'
import { WorkerQuoteQuickStats } from './WorkerQuoteQuickStats'
import { WorkerQuotesMainColumn } from './WorkerQuotesMainColumn'
import { WorkerQuotesScheduleColumn } from './WorkerQuotesScheduleColumn'

export function WorkerQuotesLayout() {
  const { quoteRows } = useWorkerQuotes()

  return (
    <Grid
      templateColumns={{ base: '1fr', xl: '240px minmax(0, 1fr) 300px' }}
      gap={{ base: 6, xl: 6 }}
      alignItems="start"
    >
      <Box display={{ base: 'none', xl: 'block' }} minW={0}>
        <Stack gap={4} position="sticky" top={6}>
          {quoteRows.length > 0 ? <WorkerQuoteQuickStats /> : null}
          <WorkerQuoteFilterColumn />
        </Stack>
      </Box>

      <WorkerQuotesMainColumn />

      {quoteRows.length > 0 ? <WorkerQuotesScheduleColumn /> : null}
    </Grid>
  )
}
