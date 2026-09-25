'use client'

import { Box, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import {
  LuCalendar,
  LuCircleCheck,
  LuFlame,
  LuInfo,
  LuMapPin,
  LuMessageSquare,
  LuWallet,
} from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'

import {
  type AchievementPanel,
  type AchievementQuotes,
  categoryMixShares,
} from '../../helpers/taskAchievements'
import bag from '../../i11n.json'

const PIE_COLORS = [
  'var(--chakra-colors-green-600)',
  'var(--chakra-colors-green-400)',
  'var(--chakra-colors-green-800)',
  'var(--chakra-colors-green-300)',
  'var(--chakra-colors-green-500)',
] as const

type StatTile = {
  key: string
  label: string
  value: string
  hint?: string
  icon: ReactNode
}

function quotesValue(
  quotes: AchievementQuotes | null,
  empty: string,
  unlimited: string,
): string {
  if (!quotes) return empty
  if (quotes.kind === 'unlimited') return unlimited
  if (quotes.kind === 'ofCap') return String(quotes.used)
  return String(quotes.count)
}

function quotesDetail(
  quotes: AchievementQuotes | null,
  copy: (typeof bag)['en']['achievements'],
): string | null {
  if (!quotes) return null
  if (quotes.kind === 'unlimited') {
    return `${copy.quotesCap}: ${copy.quotesUnlimited}`
  }
  if (quotes.kind === 'ofCap') {
    return `${copy.quotesCap}: ${formatMessage(copy.quotesOfCap, {
      used: quotes.used,
      cap: quotes.cap,
    })}`
  }
  return formatMessage(
    quotes.count === 1 ? copy.quotesReceivedOne : copy.quotesReceived,
    { count: quotes.count },
  )
}

function statTiles(
  panel: AchievementPanel,
  copy: (typeof bag)['en']['achievements'],
): StatTile[] {
  const empty = copy.statEmpty
  const count = (value: number | null) =>
    value == null ? empty : String(value)
  const agreed = panel.agreedTotalLabel ?? empty
  if (panel.role === 'worker') {
    return [
      {
        key: 'completed',
        label: copy.completedJobs,
        value: count(panel.completedCount),
        icon: <LuCircleCheck size={18} strokeWidth={2} />,
      },
      {
        key: 'quotes',
        label: copy.quotesCap,
        value: quotesValue(panel.quotes, empty, copy.quotesUnlimited),
        icon: <LuMessageSquare size={18} strokeWidth={2} />,
      },
      {
        key: 'agreed',
        label: copy.agreedTotalShort,
        hint: copy.agreedTotals,
        value: agreed,
        icon: <LuWallet size={18} strokeWidth={2} />,
      },
      {
        key: 'streak',
        label: copy.streak,
        value: count(panel.streakWeeks),
        icon: <LuFlame size={18} strokeWidth={2} />,
      },
    ]
  }
  return [
    {
      key: 'hosted',
      label: copy.hostedCompleted,
      value: count(panel.completedCount),
      icon: <LuCalendar size={18} strokeWidth={2} />,
    },
    {
      key: 'quotes',
      label: copy.quotesReceivedLabel,
      value: quotesValue(panel.quotes, empty, copy.quotesUnlimited),
      icon: <LuMessageSquare size={18} strokeWidth={2} />,
    },
    {
      key: 'agreed',
      label: copy.agreedTotalShort,
      hint: copy.agreedTotals,
      value: agreed,
      icon: <LuWallet size={18} strokeWidth={2} />,
    },
    {
      key: 'location',
      label: copy.mostUsed,
      value: panel.location ?? empty,
      icon: <LuMapPin size={18} strokeWidth={2} />,
    },
  ]
}

export function ActivityStatGrid({ panel }: { panel: AchievementPanel }) {
  const t = useI11n(bag)
  const tiles = statTiles(panel, t.achievements)
  return (
    <SimpleGrid columns={2} gap={3}>
      {tiles.map((tile) => (
        <Stack
          key={tile.key}
          h="full"
          gap={1}
          p={3}
          borderRadius="lg"
          bg="bg.subtle"
          minW={0}
          aria-label={tile.hint ? `${tile.hint}: ${tile.value}` : undefined}
        >
          <Box color="status.success.fg" aria-hidden display="inline-flex">
            {tile.icon}
          </Box>
          <Text fontSize="xs" color="text.muted" lineHeight="1.3">
            {tile.label}
          </Text>
          <Text
            fontSize={tile.value.length > 12 ? 'sm' : 'xl'}
            fontWeight={700}
            color="text.default"
            lineHeight="1.2"
            lineClamp={2}
            fontVariantNumeric="tabular-nums"
          >
            {tile.value}
          </Text>
        </Stack>
      ))}
    </SimpleGrid>
  )
}

export function ActivityCategoryMix({
  panel,
  showSharePercent,
}: {
  panel: AchievementPanel
  /** Detail view prints a share even when the compact percent is withheld. */
  showSharePercent?: boolean
}) {
  const t = useI11n(bag)
  const shares = categoryMixShares(panel.categoryMix)
  const shareByCategory = new Map(
    shares.map((share) => [share.category, share]),
  )
  if (panel.categoryMix.length === 0) return null

  return (
    <Stack gap={3}>
      <Text fontSize="sm" fontWeight={700} color="text.default">
        {t.achievements.categoryMix}
      </Text>
      {panel.categoryMix.map((item) => {
        const share = shareByCategory.get(item.category)
        const width = share?.percent ?? item.percent ?? 0
        const percent = showSharePercent
          ? (share?.percent ?? item.percent)
          : item.percent
        const active = (item.count ?? 0) > 0 || (percent ?? 0) > 0
        return (
          <Stack key={item.category} gap={1.5}>
            <HStack justify="space-between" gap={3} minW={0}>
              <HStack gap={2} minW={0}>
                <Box
                  aria-hidden
                  boxSize="8px"
                  borderRadius="full"
                  flexShrink={0}
                  bg={active ? 'action.primary' : 'border.strong'}
                />
                <Text fontSize="sm" color="text.default" lineClamp={1}>
                  {item.label}
                </Text>
              </HStack>
              <HStack
                gap={3}
                flexShrink={0}
                color="text.muted"
                fontSize="sm"
                fontVariantNumeric="tabular-nums"
              >
                {item.count != null ? <Text>{item.count}</Text> : null}
                {percent != null ? (
                  <Text minW="2.5rem" textAlign="end">
                    {percent}%
                  </Text>
                ) : null}
              </HStack>
            </HStack>
            <Box h="6px" borderRadius="full" bg="bg.subtle" aria-hidden>
              <Box
                h="full"
                w={`${Math.max(0, Math.min(100, width))}%`}
                borderRadius="full"
                bg={active ? 'action.primary' : 'transparent'}
              />
            </Box>
          </Stack>
        )
      })}
    </Stack>
  )
}

function CategoryPie({ panel }: { panel: AchievementPanel }) {
  const t = useI11n(bag)
  const shares = categoryMixShares(panel.categoryMix)
  if (shares.length === 0) return null
  let cursor = 0
  const stops = shares.map((share, index) => {
    const start = cursor
    cursor += share.percent
    const color = PIE_COLORS[index % PIE_COLORS.length]
    return `${color} ${start}% ${cursor}%`
  })
  return (
    <Stack gap={3}>
      <Text fontSize="sm" fontWeight={700} color="text.default">
        {t.achievements.categoryMix}
      </Text>
      <HStack gap={4} align="center">
        <Box
          aria-hidden
          boxSize="112px"
          borderRadius="full"
          flexShrink={0}
          css={{ background: `conic-gradient(${stops.join(', ')})` }}
        />
        <Stack gap={2} minW={0} flex={1}>
          {shares.map((share, index) => (
            <HStack key={share.category} gap={2} minW={0}>
              <Box
                aria-hidden
                boxSize="8px"
                borderRadius="full"
                flexShrink={0}
                css={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
              />
              <Text fontSize="sm" color="text.default" lineClamp={1} flex={1}>
                {share.label}
              </Text>
              <Text
                fontSize="sm"
                color="text.muted"
                fontVariantNumeric="tabular-nums"
                flexShrink={0}
              >
                {share.count} · {share.percent}%
              </Text>
            </HStack>
          ))}
        </Stack>
      </HStack>
    </Stack>
  )
}

export function ActivityPaymentNote() {
  const t = useI11n(bag)
  return (
    <HStack
      gap={2}
      align="flex-start"
      p={3}
      borderRadius="lg"
      bg="status.success.soft"
    >
      <Box
        as="span"
        aria-hidden
        display="inline-flex"
        color="status.success.fg"
        flexShrink={0}
        mt={0.5}
      >
        <LuInfo size={16} strokeWidth={2} />
      </Box>
      <Text fontSize="xs" color="text.muted" lineHeight="1.5">
        {t.achievements.disclaimer}
      </Text>
    </HStack>
  )
}

function panelHasAgreedTotal(panels: readonly AchievementPanel[]): boolean {
  return panels.some((panel) => panel.agreedTotalLabel != null)
}

export type MyTasksActivityDetailsProps = {
  panels: readonly AchievementPanel[]
}

/**
 * Owner activity detail. The My Tasks hub links here from
 * `/profile/[ownUserId]#achievements` instead of opening this in a sheet.
 */
export function MyTasksActivityDetails({
  panels,
}: MyTasksActivityDetailsProps) {
  const t = useI11n(bag)
  const showNote = panelHasAgreedTotal(panels)

  return (
    <Stack gap={6}>
      {panels.map((panel) => {
        const roleLabel =
          panel.role === 'worker'
            ? t.achievements.worker
            : t.achievements.customer
        const locationLabel =
          panel.role === 'worker'
            ? t.achievements.mostWorked
            : t.achievements.mostUsed
        const quoteLine =
          panel.quotes?.kind === 'received'
            ? null
            : quotesDetail(panel.quotes, t.achievements)
        const emptyCopy =
          panel.role === 'worker'
            ? t.achievements.emptyWorker
            : t.achievements.emptyCustomer
        const showEmpty =
          panel.sparse && !panel.quotes && panel.streakWeeks == null
        return (
          <Stack key={panel.role} gap={4}>
            <Text as="h3" fontSize="sm" fontWeight={700} color="text.default">
              {roleLabel}
            </Text>
            <ActivityStatGrid panel={panel} />
            {showEmpty ? (
              <Text fontSize="sm" color="text.muted" lineHeight="1.5">
                {emptyCopy}
              </Text>
            ) : null}
            <CategoryPie panel={panel} />
            {panel.role === 'worker' && panel.location ? (
              <Stack gap={0}>
                <Text fontSize="xs" fontWeight={700} color="text.muted">
                  {locationLabel}
                </Text>
                <Text fontSize="sm" color="text.default">
                  {panel.location}
                </Text>
              </Stack>
            ) : null}
            {quoteLine ? (
              <Text fontSize="sm" color="text.default">
                {quoteLine}
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
            {panel.agreedTotalLabel ? (
              <Stack gap={1}>
                <Text fontSize="xs" fontWeight={700} color="text.muted">
                  {t.achievements.agreedTotals}
                </Text>
                <Text
                  fontSize="xl"
                  fontWeight={700}
                  color="text.default"
                  fontVariantNumeric="tabular-nums"
                >
                  {panel.agreedTotalLabel}
                </Text>
              </Stack>
            ) : null}
          </Stack>
        )
      })}
      {showNote ? <ActivityPaymentNote /> : null}
    </Stack>
  )
}
