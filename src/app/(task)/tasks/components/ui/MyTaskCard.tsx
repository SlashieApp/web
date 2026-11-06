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

import { TaskRolePill } from '@/app/(task)/components/ui/TaskRolePill'
import { taskDetailHrefFromMyTasks } from '@/app/(task)/helpers/openTaskDetailFromBrowse'
import { setTaskHandoff } from '@/app/(task)/helpers/taskCardHandoff'
import { TaskStatusPill } from '@/app/(task)/tasks/[slug]/components/ui/TaskStatusPill'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFigure, sdlFocusRing } from '@/theme/styles'
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

/** The booked date and time, "28 Oct, 16:25"; nothing when flexible or a Before date. */
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

/**
 * Upcoming's time line, above the title: Overdue, the booked date and time
 * ("28 Oct, 16:25"), or Flexible / Before 5 Nov when there is no booked time.
 */
function upcomingTime(when: MyTaskWhen, t: Copy, locale: string): string {
  if (when.day === 'overdue') return t.when.overdue
  if (when.day === 'flexible') return t.when.flexible
  if (when.day === 'before') {
    return formatMessage(t.when.before, {
      date: formatDate(when.at, locale, { day: 'numeric', month: 'short' }),
    })
  }
  return timeLabel(when, t, locale)
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

/** The muted line under the pills. How a Past task ended is its pill, not text. */
function detailLine(row: MyTaskHubRow, t: Copy, locale: string): string {
  if (row.section === 'open') return joined(quotesLabel(row, t), row.priceLabel)
  if (row.section === 'past') {
    return joined(endedLabel(row.endedAt, locale), row.priceLabel)
  }
  // Upcoming: the time leads, above the title.
  return joined(row.location, row.priceLabel)
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
function TitleLink({ row }: { row: MyTaskHubRow }) {
  return (
    <Text
      fontSize="md"
      fontWeight={500}
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
   * `card`: Upcoming's frame. `row`: Open and Past, flat. Both show the same
   * photo, text column and button.
   */
  layout: Layout
}

/** The role pill, then the status pill once booked or how a Past task ended; 8 apart. */
function PillLine({ row }: { row: MyTaskHubRow }) {
  const t = useI11n(bag)
  const role = row.roles.includes('hosted') ? 'hosted' : 'quoted'
  return (
    <HStack gap={2} mt={1} flexWrap="wrap" data-testid="my-task-pills">
      <TaskRolePill role={role} />
      {row.outcome ? (
        <Badge
          dot
          shape="pill"
          variant={row.outcome === 'completed' ? 'success' : 'neutral'}
        >
          {t.outcomes[row.outcome]}
        </Badge>
      ) : row.status ? (
        <TaskStatusPill status={row.status} />
      ) : null}
    </HStack>
  )
}

/**
 * One task on My Tasks, the same in every section: the photo (else the
 * category's icon), then the title, a line of pills and the muted line.
 * Upcoming adds its time above the title and sits in a card. Tapping it opens
 * the task. It shows the one button task detail waits on you for (or Review),
 * else the ⋮ menu.
 */
export function MyTaskCard({ row, layout }: MyTaskCardProps) {
  const t = useI11n(bag)
  const locale = useLocale()
  const line = detailLine(row, t, locale)
  // Only Upcoming rows have a time.
  const time = row.when ? upcomingTime(row.when, t, locale) : ''
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

  // The button drops under the text when the row is too narrow for both.
  const content = (
    <HStack gap={3} rowGap={1} flexWrap="wrap">
      <HStack gap={3} flex="1 1 12rem" minW={0}>
        <RowThumbnail row={row} />
        <Stack gap={0} flex={1} minW={0}>
          {time ? (
            <Text
              {...sdlFigure}
              fontSize="lg"
              fontWeight={500}
              letterSpacing="-0.01em"
              lineHeight="1.3"
              mb={0.5}
              color={
                row.when?.day === 'overdue'
                  ? 'status.danger.fg'
                  : 'text.default'
              }
            >
              {time}
            </Text>
          ) : null}
          <TitleLink row={row} />
          <PillLine row={row} />
          {line ? (
            <Text fontSize="sm" color="text.muted" lineClamp={2} mt={1}>
              {line}
            </Text>
          ) : null}
        </Stack>
      </HStack>
      <OverOverlay ms="auto">{end}</OverOverlay>
    </HStack>
  )

  if (layout === 'row') {
    return (
      <Box
        position="relative"
        px={2}
        py={2}
        mx={-2}
        borderRadius="lg"
        _hover={{ bg: 'bg.subtle' }}
      >
        {content}
      </Box>
    )
  }

  return (
    <Card position="relative" maxW="full" p={4} _hover={{ bg: 'bg.subtle' }}>
      {content}
    </Card>
  )
}
