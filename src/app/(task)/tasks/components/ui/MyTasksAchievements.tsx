'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Card } from '@ui'

import type { AchievementPanel } from '../../helpers/taskAchievements'
import bag from '../../i11n.json'

export type MyTasksAchievementsProps = {
  panels: readonly AchievementPanel[]
  loading?: boolean
}

function MixRow({
  label,
  count,
  percent,
}: {
  label: string
  count: number | null
  percent: number | null
}) {
  const width = percent == null ? 0 : Math.max(0, Math.min(100, percent))
  return (
    <Stack gap={1}>
      <HStack justify="space-between" gap={3}>
        <Text fontSize="sm" color="text.default">
          {label}
        </Text>
        <Text
          fontSize="sm"
          color="text.muted"
          fontVariantNumeric="tabular-nums"
        >
          {percent == null ? (count ?? '') : `${percent}%`}
        </Text>
      </HStack>
      {percent != null ? (
        <Box h="6px" borderRadius="full" bg="bg.subtle" aria-hidden>
          <Box
            h="full"
            w={`${width}%`}
            borderRadius="full"
            bg="action.primary"
          />
        </Box>
      ) : null}
    </Stack>
  )
}

function AchievementCard({ panel }: { panel: AchievementPanel }) {
  const t = useI11n(bag)
  const roleLabel =
    panel.role === 'worker' ? t.achievements.worker : t.achievements.customer
  const completedLabel =
    panel.role === 'worker'
      ? t.achievements.completedJobs
      : t.achievements.hostedCompleted
  const emptyCopy =
    panel.role === 'worker'
      ? t.achievements.emptyWorker
      : t.achievements.emptyCustomer
  const locationLabel =
    panel.role === 'worker'
      ? t.achievements.mostWorked
      : t.achievements.mostUsed

  let quotesLine: string | null = null
  if (panel.quotes?.kind === 'unlimited') {
    quotesLine = `${t.achievements.quotesCap}: ${t.achievements.quotesUnlimited}`
  } else if (panel.quotes?.kind === 'ofCap') {
    quotesLine = `${t.achievements.quotesCap}: ${formatMessage(
      t.achievements.quotesOfCap,
      { used: panel.quotes.used, cap: panel.quotes.cap },
    )}`
  } else if (panel.quotes?.kind === 'received') {
    quotesLine = formatMessage(
      panel.quotes.count === 1
        ? t.achievements.quotesReceivedOne
        : t.achievements.quotesReceived,
      { count: panel.quotes.count },
    )
  }

  return (
    <Card
      layout="section"
      density="compact"
      eyebrow={roleLabel}
      heading={
        panel.completedCount == null ? undefined : String(panel.completedCount)
      }
      description={panel.completedCount == null ? undefined : completedLabel}
    >
      <Stack gap={3}>
        {panel.completedCount == null ? (
          <Text fontSize="sm" color="text.muted" lineHeight="1.5">
            {emptyCopy}
          </Text>
        ) : null}
        {panel.categoryMix.length > 0 ? (
          <Stack gap={2}>
            <Text fontSize="xs" fontWeight={700} color="text.muted">
              {t.achievements.categoryMix}
            </Text>
            {panel.categoryMix.map((item) => (
              <MixRow
                key={item.category}
                label={item.label}
                count={item.count}
                percent={item.percent}
              />
            ))}
          </Stack>
        ) : null}
        {panel.location ? (
          <Stack gap={0}>
            <Text fontSize="xs" fontWeight={700} color="text.muted">
              {locationLabel}
            </Text>
            <Text fontSize="sm" color="text.default">
              {panel.location}
            </Text>
          </Stack>
        ) : null}
        {quotesLine ? (
          <Text fontSize="sm" color="text.default">
            {quotesLine}
          </Text>
        ) : null}
        {panel.streakWeeks != null ? (
          <Text fontSize="sm" color="text.default">
            {t.achievements.streak}:{' '}
            {formatMessage(t.achievements.streakWeeks, {
              count: panel.streakWeeks,
            })}
          </Text>
        ) : null}
        <Stack gap={1}>
          <Text fontSize="xs" fontWeight={700} color="text.muted">
            {t.achievements.agreedTotals}
          </Text>
          <Text
            fontSize="lg"
            fontWeight={700}
            color="text.default"
            fontVariantNumeric="tabular-nums"
          >
            {panel.agreedTotalLabel ?? t.achievements.totalPending}
          </Text>
          <Text fontSize="xs" color="text.muted" lineHeight="1.5">
            {t.achievements.disclaimer}
          </Text>
        </Stack>
      </Stack>
    </Card>
  )
}

export function MyTasksAchievements({
  panels,
  loading = false,
}: MyTasksAchievementsProps) {
  const t = useI11n(bag)

  if (!loading && panels.length === 0) return null

  return (
    <Stack gap={3} aria-label={t.achievements.title}>
      <Text
        as="h2"
        fontSize="sm"
        fontWeight={700}
        letterSpacing="0.04em"
        textTransform="uppercase"
        color="text.muted"
      >
        {t.achievements.title}
      </Text>
      {loading ? (
        <Stack gap={2} aria-busy="true" aria-live="polite">
          <Text fontSize="sm" color="text.muted">
            {t.achievements.loading}
          </Text>
          <Box h="140px" borderRadius="lg" bg="bg.subtle" />
          <Box h="140px" borderRadius="lg" bg="bg.subtle" />
        </Stack>
      ) : (
        panels.map((panel) => (
          <AchievementCard key={panel.role} panel={panel} />
        ))
      )}
    </Stack>
  )
}
