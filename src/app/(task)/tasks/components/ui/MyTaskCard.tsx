'use client'

import {
  Box,
  type BoxProps,
  HStack,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'

import { TaskRolePill } from '@/app/(task)/components/ui/TaskRolePill'
import { taskDetailHrefFromMyTasks } from '@/app/(task)/helpers/openTaskDetailFromBrowse'
import { setTaskHandoff } from '@/app/(task)/helpers/taskCardHandoff'
import { TaskStatusPill } from '@/app/(task)/tasks/[slug]/components/ui/TaskStatusPill'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFigure, sdlFocusRing } from '@/theme/styles'
import { TASK_ORDER_SECTION_ID } from '@/utils/orderHelpers'
import { Badge, Button, Link, Thumbnail } from '@ui'

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

/** "28 Oct"; with the year when it isn't this year. */
function shortDate(at: string, locale: string): string {
  const thisYear = new Date(at).getFullYear() === new Date().getFullYear()
  return formatDate(at, locale, {
    day: 'numeric',
    month: 'short',
    ...(thisYear ? {} : { year: 'numeric' }),
  })
}

/** "{date}, 16:25", or the date alone when no time of day is set. */
function withTime(
  date: string,
  at: string,
  hasTime: boolean,
  t: Copy,
  locale: string,
): string {
  if (!hasTime) return date
  return formatMessage(t.when.dateTime, {
    date,
    time: formatDate(at, locale, {
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }),
  })
}

/** The booked date and time, "28 Oct, 16:25"; nothing when flexible or a Before date. */
function timeLabel(when: MyTaskWhen | null, t: Copy, locale: string): string {
  if (!when || when.day === 'flexible' || when.day === 'before') return ''
  return withTime(shortDate(when.at, locale), when.at, when.time, t, locale)
}

/**
 * Upcoming's time line, above the title: Overdue (its booked date and time
 * move to the muted line), Today / Tomorrow / On Wednesday with the time of
 * day, the booked date and time ("28 Oct, 16:25"), or Flexible / Before 5 Nov
 * when there is no booked time.
 */
function upcomingTime(when: MyTaskWhen, t: Copy, locale: string): string {
  switch (when.day) {
    case 'overdue':
      // "Overdue, 28 Oct": the date joins Overdue in the red slot (FE-532),
      // so it shows once and the grey line drops it.
      return formatMessage(t.when.overdueDate, {
        date: shortDate(when.at, locale),
      })
    case 'flexible':
      return t.when.flexible
    case 'before':
      return formatMessage(t.when.before, { date: shortDate(when.at, locale) })
    case 'today':
      return withTime(t.when.today, when.at, when.time, t, locale)
    case 'tomorrow':
      return withTime(t.when.tomorrow, when.at, when.time, t, locale)
    case 'weekday':
      return withTime(
        formatMessage(t.when.weekday, {
          weekday: formatDate(when.at, locale, { weekday: 'long' }),
        }),
        when.at,
        when.time,
        t,
        locale,
      )
    case 'date':
      return timeLabel(when, t, locale)
  }
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
    return joined(
      row.endedAt ? shortDate(row.endedAt, locale) : '',
      row.priceLabel,
    )
  }
  // Upcoming: the time leads, above the title. Overdue shows its date in the
  // red slot (FE-532), so the grey line is just the place and price.
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

/** The task's own photo, when it has one. No placeholder tile (Ryan, 13 Nov). */
function RowThumbnail({ row }: { row: MyTaskHubRow }) {
  if (!row.thumbnailSrc) return null
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
   * `card`: Upcoming. `row`: Open and Past. Both are the same hairline row:
   * the photo (when the task has one), the text column and the button.
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
 * One task on My Tasks, the same hairline row in every section: the task's
 * photo when it has one, then the title, a line of pills and the muted line.
 * Upcoming adds its time above the title. Tapping it opens
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
      <HStack gap={3} flex="1 1 16rem" minW={0}>
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

  // A hairline row, not a card (Ryan, 13 Nov: no card per task). The list
  // draws the lines; `layout` still names the section's kind of row.
  return (
    <Box
      position="relative"
      py={4}
      borderTopWidth="1px"
      borderColor="border.default"
      data-my-task-layout={layout}
      _hover={{ bg: 'bg.subtle' }}
    >
      {content}
    </Box>
  )
}

/**
 * The loading shape of a section: its heading, then three hairline rows with
 * the three text lines (title, pills, muted line), in the row's paddings and
 * line heights, so nothing moves when the list arrives.
 */
export function MyTasksListSkeleton() {
  return (
    <Stack gap={3} aria-hidden data-testid="my-tasks-skeleton">
      <Box h="30px" display="flex" alignItems="center">
        <Skeleton h="18px" w="96px" borderRadius="md" />
      </Box>
      <Stack gap={0} as="ul" listStyleType="none" m={0} p={0}>
        {[0, 1, 2].map((key) => (
          <Box
            as="li"
            key={key}
            py={4}
            borderTopWidth="1px"
            borderColor="border.default"
          >
            <HStack gap={3}>
              <Stack gap={0} flex={1} minW={0}>
                <Box h="1.3em" fontSize="md" display="flex" alignItems="center">
                  <Skeleton h="1em" w="70%" borderRadius="md" />
                </Box>
                <Box mt={1} h="26px" display="flex" alignItems="center">
                  <Skeleton h="full" w="40%" borderRadius="full" />
                </Box>
                <Box
                  mt={1}
                  h="1.5em"
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                >
                  <Skeleton h="1em" w="55%" borderRadius="md" />
                </Box>
              </Stack>
            </HStack>
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}
