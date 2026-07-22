'use client'

import { Box, Grid, HStack, Stack } from '@chakra-ui/react'
import { useMemo } from 'react'

import { Button, Link } from '@ui'

import { DashboardPageLayout } from '@/app/(dashboard)/components/layout/DashboardPageLayout'
import { useI11n } from '@/i18n/useI11n'
import {
  type WorkerQuoteListFilter,
  workerQuoteFilterLabel,
  workerQuoteStage,
} from '../../../helpers/workerQuoteJobs'
import { useWorkerQuotes } from '../../context/WorkerQuotesProvider'
import bag from '../../i11n.json'

import { WorkerQuoteCalendar } from '../calendar/WorkerQuoteCalendar'
import { WorkerQuoteActivity } from '../widgets/WorkerQuoteActivity'
import { WorkerQuoteQuickStats } from '../widgets/WorkerQuoteQuickStats'
import { WorkerQuoteUpcoming } from '../widgets/WorkerQuoteUpcoming'
import { WorkerQuoteFilterColumn } from './WorkerQuoteFilterColumn'
import { WorkerQuotesMainColumn } from './WorkerQuotesMainColumn'

const STAGE_FILTERS: WorkerQuoteListFilter[] = [
  'all',
  'pending',
  'booked',
  'done',
]

export function WorkerQuotesLayout() {
  const { quoteRows, stageFilter, setStageFilter } = useWorkerQuotes()
  const t = useI11n(bag)

  const stageCounts = useMemo(() => {
    const counts: Record<WorkerQuoteListFilter, number> = {
      all: quoteRows.length,
      pending: 0,
      booked: 0,
      done: 0,
    }
    for (const row of quoteRows) {
      const stage = workerQuoteStage(row.task, row.quote, row.workerOrder)
      if (stage === 'pending') counts.pending += 1
      else if (stage === 'booked') counts.booked += 1
      else if (stage === 'closed' || stage === 'ended') counts.done += 1
    }
    return counts
  }, [quoteRows])

  return (
    <DashboardPageLayout
      eyebrow={t.eyebrow}
      title={t.title}
      description={t.description}
      actions={
        <Link href={'/search'} _hover={{ textDecoration: 'none' }}>
          <Button size="sm">{t.primaryCta}</Button>
        </Link>
      }
    >
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
                <HStack gap={2} flexWrap="wrap">
                  {STAGE_FILTERS.map((key) => {
                    const n = stageCounts[key]
                    if (n === 0 && stageFilter !== key && key !== 'all') {
                      return null
                    }
                    return (
                      <Button
                        key={key}
                        size="sm"
                        variant={stageFilter === key ? 'primary' : 'ghost'}
                        onClick={() => setStageFilter(key)}
                      >
                        {workerQuoteFilterLabel(key)} ({n})
                      </Button>
                    )
                  })}
                </HStack>
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
    </DashboardPageLayout>
  )
}
