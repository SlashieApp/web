'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import { LuSearch } from 'react-icons/lu'

import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { Button, Card, Input, Link } from '@ui'

import { useMyRequestsPage } from '../context/MyRequestsProvider'
import bag from '../i11n.json'

import { PostedTaskCard } from './PostedTaskCard'
import { PostedTaskSummaryBar } from './PostedTaskSummaryBar'

export function MyRequestsMainColumn() {
  const t = useI11n(bag)
  const href = useLocalizedHref()
  const {
    loading,
    errorMessage,
    taskRows,
    visibleTasks,
    emptyHint,
    inboxFilters,
  } = useMyRequestsPage()

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

        {taskRows.length > 0 ? <PostedTaskSummaryBar /> : null}
      </Stack>

      {loading ? <Text color="text.muted">{t.loading}</Text> : null}
      {errorMessage ? (
        <Text color="status.danger.fg" fontSize="sm">
          {errorMessage}
        </Text>
      ) : null}

      {!loading && taskRows.length === 0 ? (
        <Card layout="section" p={6}>
          <Stack gap={3}>
            <Heading size="sm">{t.emptyTitle}</Heading>
            <Text color="text.muted" fontSize="sm">
              {t.emptyDescription}
            </Text>
            <Link
              href={href('/tasks/create')}
              _hover={{ textDecoration: 'none' }}
            >
              <Button alignSelf="flex-start" size="sm">
                {t.primaryCta}
              </Button>
            </Link>
          </Stack>
        </Card>
      ) : null}

      {!loading && taskRows.length > 0 && visibleTasks.length === 0 ? (
        <Card layout="section" p={6}>
          <Text color="text.muted" fontSize="sm">
            {emptyHint}
          </Text>
        </Card>
      ) : null}

      {visibleTasks.length > 0 ? (
        <Stack gap={3}>
          {visibleTasks.map(({ task, customerOrder }) => (
            <PostedTaskCard
              key={task.id}
              task={task}
              customerOrder={customerOrder}
            />
          ))}
        </Stack>
      ) : null}
    </Stack>
  )
}
