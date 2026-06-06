'use client'

import { Box, Grid, Stack } from '@chakra-ui/react'

import { useWorkerQuotes } from '../context/WorkerQuotesProvider'

import { WorkerQuoteActivity } from './WorkerQuoteActivity'
import { WorkerQuoteCalendar } from './WorkerQuoteCalendar'
import { WorkerQuoteFilterColumn } from './WorkerQuoteFilterColumn'
import { WorkerQuoteFilters } from './WorkerQuoteFilters'
import { WorkerQuoteQuickStats } from './WorkerQuoteQuickStats'
import { WorkerQuoteUpcoming } from './WorkerQuoteUpcoming'
import { WorkerQuotesMainColumn } from './WorkerQuotesMainColumn'

export function WorkerQuotesLayout() {
  const { quoteRows } = useWorkerQuotes()

  return (
    <Grid
      w="full"
      templateColumns={{
        base: 'minmax(0, 1fr)',
        md: 'minmax(0, 1fr) minmax(280px, 340px)',
        '2xl': 'minmax(220px, 300px) minmax(0, 1fr) minmax(280px, 340px)',
      }}
      gap={{ base: 6, md: 8, '2xl': 8 }}
      alignItems="start"
    >
      <Box
        minW={0}
        gridColumn={{ base: '1', md: '1', '2xl': '2' }}
        gridRow={{ base: '1', md: '1', '2xl': '1' }}
      >
        <WorkerQuotesMainColumn />
      </Box>

      <Box
        display={{ base: 'contents', md: 'flex', '2xl': 'contents' }}
        flexDirection="column"
        gap={4}
        w={{ md: 'full' }}
        gridColumn={{ md: '2' }}
        gridRow={{ md: '1 / 3' }}
        position={{ md: 'sticky' }}
        top={{ md: 6 }}
        alignSelf="start"
      >
        <Stack
          gap={4}
          minW={0}
          w="full"
          gridColumn={{ base: '1', '2xl': '1' }}
          gridRow={{ base: '2', '2xl': '1' }}
          position={{ base: 'static', '2xl': 'sticky' }}
          top={{ '2xl': 6 }}
          alignSelf="start"
        >
          {quoteRows.length > 0 ? <WorkerQuoteQuickStats /> : null}
          {quoteRows.length > 0 ? <WorkerQuoteCalendar /> : null}
          {quoteRows.length > 0 ? (
            <Box display={{ base: 'block', md: 'none' }}>
              <WorkerQuoteFilters />
            </Box>
          ) : null}
          <Box display={{ base: 'none', md: 'block' }}>
            <WorkerQuoteFilterColumn />
          </Box>
        </Stack>

        <Stack
          gap={4}
          minW={0}
          w="full"
          gridColumn={{ base: '1', '2xl': '3' }}
          gridRow={{ base: '3', '2xl': '1' }}
          position={{ base: 'static', '2xl': 'sticky' }}
          top={{ '2xl': 6 }}
          alignSelf="start"
        >
          {quoteRows.length > 0 ? <WorkerQuoteUpcoming /> : null}
          <WorkerQuoteActivity />
        </Stack>
      </Box>
    </Grid>
  )
}
