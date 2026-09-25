'use client'

import { Box, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useCallback, useState } from 'react'

import { MyTasksActivityDetails } from '@/app/(task)/tasks/components/ui/MyTasksActivityDetails'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Badge, Card, Input, Link } from '@ui'

import {
  type ActivityRange,
  type PublicProfileView,
  type PublicWorkHistoryItem,
  filterWorkHistory,
} from '../../helpers/publicProfileModel'
import { PublicProfileWorkRole } from '../../helpers/publicProfileTypes'
import bag from '../../i11n.json'

const RANGES: ActivityRange[] = ['month', 'lastMonth', 'year']
const WEEKDAY_IDS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const WEEKDAYS = {
  en: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
  'zh-hk': ['一', '二', '三', '四', '五', '六', '日'],
} as const

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}`
}

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7
}

export type PublicProfileAchievementsProps = {
  view: PublicProfileView
  now?: Date
}

/**
 * Owner-only block at `#achievements`. Reuses the My Tasks activity detail
 * (agreed totals + off-platform disclaimer) and adds the day calendar plus
 * searchable completed-work history. Strangers never mount this.
 */
export function PublicProfileAchievements({
  view,
  now,
}: PublicProfileAchievementsProps) {
  const t = useI11n(bag)
  const locale = useLocale()
  const onSectionRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || window.location.hash !== '#achievements') return
    node.scrollIntoView({ block: 'start' })
  }, [])
  const [range, setRange] = useState<ActivityRange>('month')
  const [search, setSearch] = useState('')
  const clock = now ?? new Date()
  const rows = filterWorkHistory(view.workHistory, range, clock, search)
  const counts = new Map<string, number>()
  for (const row of rows) {
    const at = new Date(row.completedAt)
    if (Number.isNaN(at.getTime())) continue
    const key = dayKey(at)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  const rangeLabel = {
    month: t.rangeMonth,
    lastMonth: t.rangeLastMonth,
    year: t.rangeYear,
  } satisfies Record<ActivityRange, string>

  return (
    <Stack
      ref={onSectionRef}
      id="achievements"
      gap={5}
      tabIndex={-1}
      css={{ scrollMarginTop: '5.5rem' }}
    >
      <Stack gap={1}>
        <Text as="h2" fontSize="xl" fontWeight={700} color="text.default">
          {t.achievementsHeading}
        </Text>
        <Text fontSize="sm" color="text.muted" maxW="40rem">
          {t.achievementsIntro}
        </Text>
      </Stack>
      {view.achievements.length > 0 ? (
        <Card p={{ base: 4, md: 5 }}>
          <MyTasksActivityDetails panels={view.achievements} />
        </Card>
      ) : (
        <Text fontSize="sm" color="text.muted">
          {t.achievementsEmpty}
        </Text>
      )}
      <Card layout="section" heading={t.calendarLabel}>
        <Stack gap={4}>
          <HStack gap={2} flexWrap="wrap">
            {RANGES.map((value) => {
              const selected = value === range
              return (
                <Badge
                  key={value}
                  as="button"
                  variant={selected ? 'success' : 'neutral'}
                  shape="pill"
                  size="lg"
                  cursor="pointer"
                  aria-pressed={selected}
                  onClick={() => setRange(value)}
                >
                  {rangeLabel[value]}
                </Badge>
              )
            })}
          </HStack>
          <Input
            aria-label={t.historySearchLabel}
            placeholder={t.historySearchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {range === 'year' ? (
            <YearCounts
              rows={rows}
              year={clock.getFullYear()}
              locale={locale}
            />
          ) : (
            <MonthGrid
              counts={counts}
              range={range}
              now={clock}
              locale={locale}
              label={t.calendarLabel}
              jobLabel={t.calendarJobs}
            />
          )}
          {rows.length === 0 ? (
            <Text fontSize="sm" color="text.muted">
              {t.historyEmpty}
            </Text>
          ) : (
            <Stack gap={2}>
              {rows.map((row) => (
                <HistoryRow
                  key={row.orderId}
                  row={row}
                  locale={locale}
                  roleLabel={
                    row.role === PublicProfileWorkRole.Worker
                      ? t.historyRoleWorker
                      : t.historyRoleCustomer
                  }
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Card>
    </Stack>
  )
}

function HistoryRow({
  row,
  locale,
  roleLabel,
}: {
  row: PublicWorkHistoryItem
  locale: 'en' | 'zh-hk'
  roleLabel: string
}) {
  const at = new Date(row.completedAt)
  const when = Number.isNaN(at.getTime())
    ? ''
    : at.toLocaleDateString(locale === 'zh-hk' ? 'zh-HK' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
  return (
    <HStack
      justify="space-between"
      gap={3}
      py={2}
      borderTopWidth="1px"
      borderColor="border.default"
    >
      <Stack gap={0.5} minW={0}>
        <Link href={`/tasks/${row.taskId}`} tone="emphasis">
          {row.title}
        </Link>
        <Text fontSize="xs" color="text.muted">
          {[roleLabel, row.categoryLabel, row.areaLabel, when]
            .filter(Boolean)
            .join(' · ')}
        </Text>
      </Stack>
    </HStack>
  )
}

function MonthGrid({
  counts,
  range,
  now,
  locale,
  label,
  jobLabel,
}: {
  counts: Map<string, number>
  range: ActivityRange
  now: Date
  locale: 'en' | 'zh-hk'
  label: string
  jobLabel: string
}) {
  const cursor =
    range === 'lastMonth'
      ? new Date(now.getFullYear(), now.getMonth() - 1, 1)
      : new Date(now.getFullYear(), now.getMonth(), 1)
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const lead = mondayIndex(new Date(year, month, 1))
  const count = new Date(year, month + 1, 0).getDate()
  const cells = [
    ...Array.from({ length: lead }, (_, offset) => ({
      id: `lead-${year}-${month}-${offset}`,
      day: null as number | null,
    })),
    ...Array.from({ length: count }, (_, offset) => ({
      id: `${year}-${month}-${offset + 1}`,
      day: offset + 1,
    })),
  ]
  const title = cursor.toLocaleDateString(
    locale === 'zh-hk' ? 'zh-HK' : 'en-GB',
    {
      month: 'long',
      year: 'numeric',
    },
  )
  const weekdays = WEEKDAYS[locale]

  return (
    <Stack gap={2} aria-label={label}>
      <Text fontSize="sm" fontWeight={700}>
        {title}
      </Text>
      <SimpleGrid columns={7} gap={1}>
        {WEEKDAY_IDS.map((id) => (
          <Text key={id} fontSize="xs" color="text.muted" textAlign="center">
            {weekdays[WEEKDAY_IDS.indexOf(id)]}
          </Text>
        ))}
        {cells.map((cell) => {
          if (cell.day == null) return <Box key={cell.id} h="36px" />
          const jobs = counts.get(cell.id) ?? 0
          return (
            <Stack
              key={cell.id}
              h="36px"
              align="center"
              justify="center"
              gap={0}
              borderRadius="md"
              bg={jobs > 0 ? 'status.success.soft' : 'transparent'}
            >
              <Text fontSize="xs" fontVariantNumeric="tabular-nums">
                {cell.day}
              </Text>
              {jobs > 0 ? (
                <Box
                  boxSize="4px"
                  borderRadius="full"
                  bg="action.primary"
                  aria-label={formatMessage(jobLabel, { count: jobs })}
                />
              ) : null}
            </Stack>
          )
        })}
      </SimpleGrid>
    </Stack>
  )
}

function YearCounts({
  rows,
  year,
  locale,
}: {
  rows: readonly PublicWorkHistoryItem[]
  year: number
  locale: 'en' | 'zh-hk'
}) {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const at = new Date(row.completedAt)
    if (Number.isNaN(at.getTime()) || at.getFullYear() !== year) continue
    const key = monthKey(at)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return (
    <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={2}>
      {Array.from({ length: 12 }, (_, offset) => {
        const date = new Date(year, offset, 1)
        const id = monthKey(date)
        const count = counts.get(id) ?? 0
        const label = date.toLocaleDateString(
          locale === 'zh-hk' ? 'zh-HK' : 'en-GB',
          { month: 'short' },
        )
        return (
          <Stack
            key={id}
            gap={0}
            px={3}
            py={2}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="border.default"
            bg={count > 0 ? 'status.success.soft' : 'bg.surface'}
          >
            <Text fontSize="sm" fontWeight={600}>
              {label}
            </Text>
            <Text
              fontSize="xs"
              color="text.muted"
              fontVariantNumeric="tabular-nums"
            >
              {count}
            </Text>
          </Stack>
        )
      })}
    </SimpleGrid>
  )
}
