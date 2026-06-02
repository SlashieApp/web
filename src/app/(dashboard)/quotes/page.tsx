'use client'

import { Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useMemo, useState } from 'react'

import { Button, SectionCard } from '@ui'

import { useAccountOrders } from '../helpers/useAccountOrders'
import { useMyQuotes } from '../helpers/useMyQuotes'
import {
  type WorkerQuoteListFilter,
  buildWorkerQuoteRows,
  workerQuoteMatchesFilter,
  workerQuoteStage,
} from '../helpers/workerQuoteJobs'
import { WorkerQuoteCard } from './components/WorkerQuoteCard'
import {
  WorkerQuoteFilters,
  workerQuoteFilterEmptyHint,
} from './components/WorkerQuoteFilters'

export default function MyQuotesPage() {
  const {
    me,
    loading: tasksLoading,
    errorMessage: tasksError,
    sentQuotes,
  } = useMyQuotes()
  const {
    orders,
    loading: ordersLoading,
    errorMessage: ordersError,
  } = useAccountOrders()

  const [filter, setFilter] = useState<WorkerQuoteListFilter>('all')

  const meId = me?.id

  const quoteRows = useMemo(() => {
    if (!meId) return []
    return buildWorkerQuoteRows(sentQuotes, orders, meId)
  }, [sentQuotes, orders, meId])

  const visibleQuotes = useMemo(() => {
    if (filter === 'all') return quoteRows
    return quoteRows.filter((row) =>
      workerQuoteMatchesFilter(
        workerQuoteStage(row.task, row.quote, row.workerOrder),
        filter,
      ),
    )
  }, [quoteRows, filter])

  const loading = tasksLoading || ordersLoading
  const errorMessage = tasksError ?? ordersError

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Stack gap={1}>
          <Heading size="xl">My Quotes</Heading>
          <Text color="formLabelMuted">
            Quotes you sent on other people&apos;s tasks — filter by pending,
            booked, or done.
          </Text>
        </Stack>

        {quoteRows.length > 0 ? (
          <WorkerQuoteFilters
            rows={quoteRows}
            filter={filter}
            onFilterChange={setFilter}
          />
        ) : null}
      </Stack>

      {loading ? (
        <Text color="formLabelMuted">Loading your quotes…</Text>
      ) : null}
      {errorMessage ? (
        <Text color="red.500" fontSize="sm">
          {errorMessage}
        </Text>
      ) : null}

      {!loading && quoteRows.length === 0 ? (
        <SectionCard p={6}>
          <Stack gap={3}>
            <Heading size="sm">No quotes yet</Heading>
            <Text color="formLabelMuted" fontSize="sm">
              Browse open tasks near you and send your first quote to start
              earning.
            </Text>
            <Link as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
              <Button alignSelf="flex-start" size="sm">
                Browse tasks
              </Button>
            </Link>
          </Stack>
        </SectionCard>
      ) : null}

      {!loading && quoteRows.length > 0 && visibleQuotes.length === 0 ? (
        <SectionCard p={6}>
          <Text color="formLabelMuted" fontSize="sm">
            {workerQuoteFilterEmptyHint(filter)}
          </Text>
        </SectionCard>
      ) : null}

      {visibleQuotes.length > 0 ? (
        <Stack gap={3}>
          {visibleQuotes.map((row) => (
            <WorkerQuoteCard key={row.quote.id} {...row} />
          ))}
        </Stack>
      ) : null}
    </Stack>
  )
}
