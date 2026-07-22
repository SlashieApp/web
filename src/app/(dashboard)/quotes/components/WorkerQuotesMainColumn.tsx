'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { LuSearch } from 'react-icons/lu'

import { TaskCard } from '@/app/(task)/components/TaskCard'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { Button, Card, Input, Link } from '@ui'

import { useWorkerQuotes } from '../context/WorkerQuotesProvider'
import bag from '../i11n.json'

import { WorkerQuoteSummaryBar } from './WorkerQuoteSummaryBar'

export function WorkerQuotesMainColumn() {
  const t = useI11n(bag)
  const href = useLocalizedHref()
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
          placeholder={t.searchPlaceholder}
          type="search"
          inputMode="search"
          autoComplete="off"
          aria-label={t.searchPlaceholder}
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

      {loading ? <Text color="text.muted">{t.loading}</Text> : null}
      {errorMessage ? (
        <Text color="status.danger.fg" fontSize="sm">
          {errorMessage}
        </Text>
      ) : null}

      {!loading && quoteRows.length === 0 ? (
        <Card layout="section" p={6}>
          <Stack gap={3}>
            <Heading size="sm">{t.emptyTitle}</Heading>
            <Text color="text.muted" fontSize="sm">
              {t.emptyDescription}
            </Text>
            <Link href={href('/tasks')} _hover={{ textDecoration: 'none' }}>
              <Button alignSelf="flex-start" size="sm">
                {t.primaryCta}
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
