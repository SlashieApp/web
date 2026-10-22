'use client'

import { Box, type BoxProps, HStack, Stack, Text } from '@chakra-ui/react'
import type { IconType } from 'react-icons'
import {
  LuBike,
  LuBrush,
  LuDroplets,
  LuHammer,
  LuLaptop,
  LuLeaf,
  LuSparkles,
  LuTag,
  LuTruck,
  LuWrench,
  LuZap,
} from 'react-icons/lu'

import { taskDetailHrefFromMyTasks } from '@/app/(task)/helpers/openTaskDetailFromBrowse'
import { setTaskHandoff } from '@/app/(task)/helpers/taskCardHandoff'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFocusRing } from '@/theme/styles'
import { TASK_ORDER_SECTION_ID } from '@/utils/orderHelpers'
import { Badge, Button, Card, Link, Thumbnail } from '@ui'

import type {
  MyTaskAction,
  MyTaskHubRow,
  MyTaskWhen,
} from '../../helpers/myTasksHub'
import bag from '../../i11n.json'
import { MyTaskCardMenu } from './MyTaskCardMenu'

type Copy = (typeof bag)['en']

type Layout = 'card' | 'row'

/** Task detail's quotes list (`QuotesModule`). */
const TASK_QUOTES_SECTION_ID = 'task-quotes'

/**
 * The photo placeholder's icon. Categories are open text (BE-79), so the
 * first one is matched by word, as on Expo; anything else gets a tag.
 */
const CATEGORY_ICONS: readonly (readonly [word: string, icon: IconType])[] = [
  ['clean', LuSparkles],
  ['moving', LuTruck],
  ['removal', LuTruck],
  ['repair', LuWrench],
  ['handyman', LuWrench],
  ['plumb', LuDroplets],
  ['electr', LuZap],
  ['garden', LuLeaf],
  ['paint', LuBrush],
  ['assembl', LuHammer],
  ['deliver', LuBike],
  ['tech', LuLaptop],
]

function categoryIcon(categories: readonly string[]): IconType {
  const first = categories[0]?.toLowerCase() ?? ''
  return CATEGORY_ICONS.find(([word]) => first.includes(word))?.[1] ?? LuTag
}

function formatDate(
  at: string,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(
    locale === 'zh-hk' ? 'zh-HK' : 'en-GB',
    options,
  ).format(new Date(at))
}

/** Upcoming's heading: Today, Tomorrow, On Wednesday, Thu 5 Nov, Overdue, Before 5 Nov or Flexible. */
function dayLabel(when: MyTaskWhen, t: Copy, locale: string): string {
  switch (when.day) {
    case 'flexible':
      return t.when.flexible
    case 'overdue':
      return t.when.overdue
    case 'today':
      return t.when.today
    case 'tomorrow':
      return t.when.tomorrow
    case 'weekday':
      return formatMessage(t.when.weekday, {
        weekday: formatDate(when.at, locale, { weekday: 'long' }),
      })
    case 'date':
      return formatDate(when.at, locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
    case 'before':
      return formatMessage(t.when.before, {
        date: formatDate(when.at, locale, { day: 'numeric', month: 'short' }),
      })
  }
}

/** The booked date and time under the heading, "28 Oct, 16:25"; nothing when flexible or a Before date. */
function timeLabel(when: MyTaskWhen | null, t: Copy, locale: string): string {
  if (!when || when.day === 'flexible' || when.day === 'before') return ''
  const date = formatDate(when.at, locale, { day: 'numeric', month: 'short' })
  if (!when.time) return date
  return formatMessage(t.when.dateTime, {
    date,
    time: formatDate(when.at, locale, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }),
  })
}

/** When it ended ("28 Oct"; with the year when it isn't this year). */
function endedLabel(at: string | null, locale: string): string {
  if (!at) return ''
  const thisYear = new Date(at).getFullYear() === new Date().getFullYear()
  return formatDate(at, locale, {
    day: 'numeric',
    month: 'short',
    ...(thisYear ? {} : { year: 'numeric' }),
  })
}

/** "3 quotes" on your open task; "Quote sent" on a quote you sent. */
function quotesLabel(row: MyTaskHubRow, t: Copy): string {
  if (!row.roles.includes('hosted')) return t.line.quoteSent
  if (row.liveQuoteCount === 0) return t.line.noQuotes
  if (row.liveQuoteCount === 1) return t.line.quoteOne
  return formatMessage(t.line.quotes, { count: row.liveQuoteCount })
}

function joined(...parts: string[]): string {
  return parts.filter(Boolean).join(' · ')
}

/** The muted line under the title. */
function detailLine(
  row: MyTaskHubRow,
  layout: Layout,
  t: Copy,
  locale: string,
): string {
  if (row.section === 'open') return joined(quotesLabel(row, t), row.priceLabel)
  if (row.section === 'past') {
    const ended = endedLabel(row.endedAt, locale)
    // The card shows how it ended as a badge; a row says it in the line.
    const outcome =
      layout === 'row' && row.outcome ? t.outcomes[row.outcome] : ''
    return joined(outcome, ended, row.priceLabel)
  }
  // Upcoming: the card leads with the day.
  return joined(timeLabel(row.when, t, locale), row.location, row.priceLabel)
}

/** The task at the button's action, or the review form. */
function actionHref(row: MyTaskHubRow, action: MyTaskAction): string {
  if (action === 'review') {
    const order = row.orderId
      ? `?orderId=${encodeURIComponent(row.orderId)}`
      : ''
    return `/tasks/${row.id}/review${order}`
  }
  const section =
    action === 'compareQuotes' ? TASK_QUOTES_SECTION_ID : TASK_ORDER_SECTION_ID
  return `${taskDetailHrefFromMyTasks(row.id)}#${section}`
}

/**
 * The title is the link to the task; its overlay makes the whole card or row
 * tappable. Inline (not Link's inline-flex) so the two-line clamp applies.
 */
function TitleLink({
  row,
  fontSize,
  fontWeight,
}: {
  row: MyTaskHubRow
  fontSize: 'md' | 'lg'
  fontWeight: number
}) {
  return (
    <Text
      fontSize={fontSize}
      fontWeight={fontWeight}
      color="text.default"
      lineHeight="1.3"
      lineClamp={2}
    >
      <Link
        href={taskDetailHrefFromMyTasks(row.id)}
        display="inline"
        color="text.default"
        _hover={{ color: 'text.default', textDecoration: 'none' }}
        _before={{
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'lg',
        }}
        _focusVisible={{ outline: 'none', _before: sdlFocusRing }}
        onClick={() =>
          // Task detail paints the title and place at once (shared handoff).
          setTaskHandoff({
            id: row.id,
            title: row.title,
            description: '',
            location: row.location,
            priceLabel: row.priceLabel,
          })
        }
      >
        {row.title}
      </Link>
    </Text>
  )
}

function RowThumbnail({ row }: { row: MyTaskHubRow }) {
  if (row.thumbnailSrc) {
    return (
      <Thumbnail
        alt=""
        src={row.thumbnailSrc}
        size="sm"
        minW="56px"
        w="56px"
        borderRadius="md"
        flexShrink={0}
      />
    )
  }
  const Icon = categoryIcon(row.categories)
  return (
    <Box
      aria-hidden
      display="flex"
      alignItems="center"
      justifyContent="center"
      boxSize="56px"
      flexShrink={0}
      borderRadius="md"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.surface"
      color="text.muted"
    >
      <Icon size={24} />
    </Box>
  )
}

/** Above the title link's overlay, so it takes its own taps. */
function OverOverlay({ children, ...rest }: BoxProps) {
  return (
    <Box position="relative" zIndex={1} flexShrink={0} {...rest}>
      {children}
    </Box>
  )
}

export type MyTaskCardProps = {
  row: MyTaskHubRow
  /**
   * `card`: an Upcoming job led by its day, or the newest Past task (no
   * photo, with how it ended). `row`: a compact row with a square photo.
   */
  layout: Layout
}

/**
 * One task on My Tasks. Tapping it opens the task. It shows the one button
 * task detail waits on you for (or Review), else the ⋮ menu.
 */
export function MyTaskCard({ row, layout }: MyTaskCardProps) {
  const t = useI11n(bag)
  const locale = useLocale()
  const line = detailLine(row, layout, t, locale)
  // Every row can have one, so its name says which task.
  const end = row.action ? (
    <Button
      asChild
      size="sm"
      minH="44px"
      borderRadius="full"
      variant={row.action === 'review' ? 'secondary' : 'primary'}
    >
      <Link
        href={actionHref(row, row.action)}
        aria-label={formatMessage(t.actions.label, {
          action: t.actions[row.action],
          title: row.title,
        })}
        _hover={{ textDecoration: 'none' }}
      >
        {t.actions[row.action]}
      </Link>
    </Button>
  ) : (
    <MyTaskCardMenu row={row} />
  )

  if (layout === 'row') {
    // The button drops under the text when the row is too narrow for both.
    return (
      <HStack
        position="relative"
        gap={3}
        rowGap={1}
        flexWrap="wrap"
        px={2}
        py={2}
        mx={-2}
        borderRadius="lg"
        _hover={{ bg: 'bg.subtle' }}
      >
        <HStack gap={3} flex="1 1 12rem" minW={0}>
          <RowThumbnail row={row} />
          <Stack gap={0.5} flex={1} minW={0}>
            <TitleLink row={row} fontSize="md" fontWeight={600} />
            {line ? (
              <Text fontSize="sm" color="text.muted" lineClamp={2}>
                {line}
              </Text>
            ) : null}
          </Stack>
        </HStack>
        <OverOverlay ms="auto">{end}</OverOverlay>
      </HStack>
    )
  }

  // Only Upcoming rows have a day.
  const day = row.when ? dayLabel(row.when, t, locale) : null

  return (
    <Card position="relative" maxW="full" p={4} _hover={{ bg: 'bg.subtle' }}>
      <HStack align="flex-start" gap={3}>
        <Stack gap={1} flex={1} minW={0}>
          {day ? (
            <Text
              fontSize="lg"
              fontWeight={700}
              color={
                row.when?.day === 'overdue'
                  ? 'status.danger.fg'
                  : 'text.default'
              }
              lineHeight="1.3"
            >
              {day}
            </Text>
          ) : null}
          <TitleLink
            row={row}
            fontSize={day ? 'md' : 'lg'}
            fontWeight={day ? 600 : 700}
          />
          {line ? (
            <Text fontSize="sm" color="text.muted">
              {line}
            </Text>
          ) : null}
        </Stack>
        {row.action ? null : (
          <OverOverlay mt={-2} me={-2}>
            {end}
          </OverOverlay>
        )}
      </HStack>
      {row.outcome || row.action ? (
        <HStack gap={3} mt={3} align="center" flexWrap="wrap">
          {row.outcome ? (
            <Badge
              dot
              variant={row.outcome === 'completed' ? 'success' : 'neutral'}
            >
              {t.outcomes[row.outcome]}
            </Badge>
          ) : null}
          {row.action ? <OverOverlay ms="auto">{end}</OverOverlay> : null}
        </HStack>
      ) : null}
    </Card>
  )
}
