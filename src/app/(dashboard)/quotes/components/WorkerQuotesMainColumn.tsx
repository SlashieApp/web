'use client'

import { Box, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { LuSearch } from 'react-icons/lu'

import { Button, Input, SectionCard } from '@ui'

import { useWorkerQuotes } from '../context/WorkerQuotesProvider'

import { WorkerQuoteCard } from './WorkerQuoteCard'
import { WorkerQuoteFilters } from './WorkerQuoteFilters'
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
        <Stack gap={1}>
          <Heading size="xl">My Quotes</Heading>
          <Text color="formLabelMuted">
            Quotes you sent on other people&apos;s tasks — filter by pending,
            booked, or done.
          </Text>
        </Stack>

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

        {quoteRows.length > 0 ? (
          <Box display={{ base: 'block', xl: 'none' }}>
            <WorkerQuoteFilters />
          </Box>
        ) : null}

        {quoteRows.length > 0 ? <WorkerQuoteSummaryBar /> : null}
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
            {emptyHint}
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
