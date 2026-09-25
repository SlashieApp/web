'use client'

import { Box, HStack, Heading, Skeleton, Stack, Text } from '@chakra-ui/react'

import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, Card, Link } from '@ui'

import type {
  MyTaskHubRow,
  MyTaskHubSection,
  MyTaskTiming,
} from '../../helpers/myTasksHub'
import bag from '../../i11n.json'
import { MyTasksHubCard } from './MyTasksHubCard'

export type MyTasksListProps = {
  sections: readonly MyTaskHubSection[]
  loading?: boolean
  errorMessage?: string | null
  onRetry?: () => void
  onOpen: (taskId: string) => void
}

function formatTiming(
  timing: MyTaskTiming,
  copy: (typeof bag)['en'],
  locale: string,
): string {
  switch (timing.kind) {
    case 'overdue':
      return copy.timing.overdue
    case 'today':
      return copy.timing.today
    case 'tomorrow':
      return copy.timing.tomorrow
    case 'flexible':
      return copy.timing.flexible
    case 'before':
      return formatMessage(copy.timing.before, { date: timing.date })
    case 'scheduled':
      return new Intl.DateTimeFormat(locale === 'zh-hk' ? 'zh-HK' : 'en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(timing.at))
  }
}

function detailLine(
  row: MyTaskHubRow,
  copy: (typeof bag)['en'],
): string | undefined {
  if (row.acceptedWorkerName) {
    return formatMessage(copy.withWorker, { name: row.acceptedWorkerName })
  }
  if (row.quoteCount > 0) {
    return formatMessage(
      row.quoteCount === 1 ? copy.quoteCountOne : copy.quoteCount,
      { count: row.quoteCount },
    )
  }
  if (row.ownerName && !row.roles.includes('hosted')) {
    return formatMessage(copy.hostedBy, { name: row.ownerName })
  }
  return undefined
}

function HubCardSkeleton() {
  return (
    <Card maxW="full" p={4} aria-hidden>
      <HStack gap={3} align="flex-start">
        <Skeleton boxSize="56px" borderRadius="lg" flexShrink={0} />
        <Stack flex={1} gap={2}>
          <Skeleton h="12px" w="28%" borderRadius="full" />
          <Skeleton h="16px" w="72%" borderRadius="md" />
          <Skeleton h="12px" w="88%" borderRadius="md" />
        </Stack>
      </HStack>
    </Card>
  )
}

export function MyTasksList({
  sections,
  loading = false,
  errorMessage = null,
  onRetry,
  onOpen,
}: MyTasksListProps) {
  const t = useI11n(bag)
  const locale = useLocale()
  const isEmpty = sections.every((section) => section.rows.length === 0)

  if (loading && isEmpty) {
    return (
      <Stack gap={2} aria-busy="true" aria-live="polite">
        <Text fontSize="sm" color="text.muted">
          {t.loading}
        </Text>
        <HubCardSkeleton />
        <HubCardSkeleton />
        <HubCardSkeleton />
      </Stack>
    )
  }

  if (errorMessage && isEmpty) {
    return (
      <Stack gap={3} role="alert" maxW="36rem" py={6}>
        <Heading as="h2" size="md" color="text.default">
          {t.errorTitle}
        </Heading>
        <Text fontSize="sm" color="text.muted" lineHeight="1.5">
          {errorMessage}
        </Text>
        {onRetry ? (
          <Button
            type="button"
            variant="secondary"
            alignSelf="flex-start"
            minH="44px"
            onClick={onRetry}
          >
            {t.retry}
          </Button>
        ) : null}
      </Stack>
    )
  }

  if (isEmpty) {
    return (
      <Stack gap={3} maxW="36rem" py={4}>
        <Heading as="h2" size="md" color="text.default">
          {t.empty.title}
        </Heading>
        <Text fontSize="sm" color="text.muted" lineHeight="1.5">
          {t.empty.description}
        </Text>
        <HStack gap={2} flexWrap="wrap">
          <Button asChild size="sm">
            <Link href="/tasks/create" _hover={{ textDecoration: 'none' }}>
              {t.empty.post}
            </Link>
          </Button>
          <Button asChild size="sm" variant="secondary">
            <Link href="/search" _hover={{ textDecoration: 'none' }}>
              {t.empty.browse}
            </Link>
          </Button>
        </HStack>
      </Stack>
    )
  }

  return (
    <Stack gap={8}>
      {errorMessage ? (
        <HStack
          gap={3}
          role="alert"
          justify="space-between"
          align="center"
          flexWrap="wrap"
        >
          <Text fontSize="sm" color="text.muted">
            {errorMessage}
          </Text>
          {onRetry ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              minH="44px"
              onClick={onRetry}
            >
              {t.retry}
            </Button>
          ) : null}
        </HStack>
      ) : null}
      {sections.map((section) => (
        <Stack key={section.id} gap={3}>
          <Heading
            as="h2"
            fontSize="md"
            fontWeight={700}
            color="text.default"
            letterSpacing="-0.01em"
          >
            {t.sections[section.id]} ({section.rows.length})
          </Heading>
          <Stack gap={3}>
            {section.rows.map((row) => {
              const tags = row.roles.map((role) => t.tags[role])
              const timingLabel = formatTiming(row.timing, t, locale)
              return (
                <MyTasksHubCard
                  key={row.id}
                  row={row}
                  tags={tags}
                  timingLabel={timingLabel}
                  detail={detailLine(row, t)}
                  statusLabel={t.status[section.id]}
                  section={section.id}
                  activateAriaLabel={formatMessage(t.openTask, {
                    title: row.title,
                    tags:
                      tags.join(', ') ||
                      row.categoryLabel ||
                      t.status[section.id],
                    status: t.status[section.id],
                    timing: timingLabel,
                  })}
                  onOpen={onOpen}
                />
              )
            })}
          </Stack>
        </Stack>
      ))}
      <Box aria-hidden h={1} />
    </Stack>
  )
}
