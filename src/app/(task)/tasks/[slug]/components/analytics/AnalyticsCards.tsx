'use client'

import { Grid, Skeleton, Stack } from '@chakra-ui/react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Card } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { taskOwnerAnalytics } from '../../helpers/taskOwnerAnalytics'
import bag from '../../i11n.json'

function AnalyticsStatCard({
  heading,
  value,
  hint,
  pending,
}: {
  heading: string
  value?: string
  hint?: string
  pending?: boolean
}) {
  return (
    <Card
      layout="section"
      heading={heading}
      description={hint}
      metric={pending ? undefined : value}
    >
      {pending ? <Skeleton h="28px" w="48%" borderRadius="md" /> : null}
    </Card>
  )
}

function hoursToQuoteLabel(
  hours: number | null,
  copy: {
    waiting: string
    underOneHour: string
    oneHour: string
    manyHours: string
  },
): string {
  if (hours == null) return copy.waiting
  if (hours < 1) return copy.underOneHour
  const rounded = Math.max(1, Math.round(hours))
  if (rounded === 1) return copy.oneHour
  return formatMessage(copy.manyHours, { count: rounded })
}

/**
 * Owner-only performance stats for the Analytics tab — one card per signal.
 */
export function AnalyticsCards() {
  const { task, pending, permissions } = useTaskDetail()
  const t = useI11n(bag)
  const a = t.analytics

  if (!permissions.isOwner) return null
  if (!task && !pending) return null

  const stats = task ? taskOwnerAnalytics(task) : null
  const loading = pending && !task
  const viewsValue =
    stats?.views == null
      ? a.viewsColdStart
      : formatMessage(stats.views === 1 ? a.viewsOne : a.viewsMany, {
          count: stats.views,
        })
  const quotesValue = stats
    ? formatMessage(stats.quoteCount === 1 ? a.quotesOne : a.quotesMany, {
        count: stats.quoteCount,
      })
    : undefined
  const acceptedValue = stats
    ? formatMessage(
        stats.acceptedCount === 1 ? a.acceptedOne : a.acceptedMany,
        { count: stats.acceptedCount },
      )
    : undefined
  const interestValue = stats ? a.interestLevel[stats.interest] : undefined
  const timeValue = stats
    ? hoursToQuoteLabel(stats.averageHoursToQuote, a.timeToQuote)
    : undefined

  return (
    <Stack
      id="owner-task-performance"
      gap={5}
      w="full"
      minW={0}
      pointerEvents="auto"
    >
      <Grid
        templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
        gap={4}
      >
        <AnalyticsStatCard
          heading={a.views}
          value={viewsValue}
          hint={a.viewsHint}
          pending={loading}
        />
        <AnalyticsStatCard
          heading={a.quotes}
          value={quotesValue}
          hint={a.quotesHint}
          pending={loading}
        />
        <AnalyticsStatCard
          heading={a.interest}
          value={interestValue}
          hint={a.interestHint[stats?.interest ?? 'low']}
          pending={loading}
        />
        <AnalyticsStatCard
          heading={a.timeToQuote.heading}
          value={timeValue}
          hint={a.timeToQuote.hint}
          pending={loading}
        />
        <AnalyticsStatCard
          heading={a.accepted}
          value={acceptedValue}
          hint={a.acceptedHint}
          pending={loading}
        />
      </Grid>
    </Stack>
  )
}
