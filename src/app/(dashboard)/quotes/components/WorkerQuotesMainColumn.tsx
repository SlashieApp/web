'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { LuSearch } from 'react-icons/lu'

import { Button, Card, Input, Link } from '@ui'

import { TaskCard } from '@/app/(task)/components/TaskCard'

import { useWorkerQuotes } from '../context/WorkerQuotesProvider'

import { WorkerQuoteSummaryBar } from './WorkerQuoteSummaryBar'

export function WorkerQuotesMainColumn() {
  const {
    loading,
    errorMessage,
    quoteRows,
    visibleQuotes,
    emptyHint,
    inboxFilters,
  } = useWorkerQuotes()

  return (
    <Stack gap={6} minW={0}>
      <Stack gap={3}>
        <Input
          startElement={
            <Box as="span" aria-hidden display="inline-flex">
              <LuSearch size={18} strokeWidth={2} />
            </Box>
          }
          value={inboxFilters.searchDraft}
          placeholder="Search tasks you quoted"
          type="search"
          inputMode="search"
          autoComplete="off"
          aria-label="Search tasks you quoted"
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            inboxFilters.setSearchDraft(e.target.value)
          }
          onBlur={inboxFilters.commitSearch}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key !== 'Enter') return
            e.preventDefault()
            inboxFilters.commitSearch()
          }}
        />

        {quoteRows.length > 0 ? <WorkerQuoteSummaryBar /> : null}
      </Stack>

      {loading ? <Text color="text.muted">Loading your quotes…</Text> : null}
      {errorMessage ? (
        <Text color="status.danger.fg" fontSize="sm">
          {errorMessage}
        </Text>
      ) : null}

      {!loading && quoteRows.length === 0 ? (
        <Card layout="section" p={6}>
          <Stack gap={3}>
            <Heading size="sm">No quotes yet</Heading>
            <Text color="text.muted" fontSize="sm">
              Browse open tasks near you and send your first quote to start
              earning.
            </Text>
            <Link href="/tasks" _hover={{ textDecoration: 'none' }}>
              <Button alignSelf="flex-start" size="sm">
                Browse tasks
              </Button>
            </Link>
          </Stack>
        </Card>
      ) : null}

      {!loading && quoteRows.length > 0 && visibleQuotes.length === 0 ? (
        <Card layout="section" p={6}>
          <Text color="text.muted" fontSize="sm">
            {emptyHint}
          </Text>
        </Card>
      ) : null}

      {visibleQuotes.length > 0 ? (
        <Stack gap={3}>
          {visibleQuotes.map((row) => (
            <TaskCard key={row.quote.id} variant="workerQuote" {...row} />
          ))}
        </Stack>
      ) : null}
    </Stack>
  )
}
