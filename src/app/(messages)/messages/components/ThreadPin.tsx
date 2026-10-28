'use client'

import { HStack, Skeleton, Stack, Text } from '@chakra-ui/react'
import { QuoteStatus } from '@codegen/schema'
import type { ThreadFieldsFragment } from '@codegen/schema'

import { useSummaryLines } from '@/app/(task)/tasks/[slug]/components/summary/TaskSummary'
import { useDateLocale } from '@/app/(task)/tasks/[slug]/components/summary/facts/TaskFacts'
import { TaskStatusPill } from '@/app/(task)/tasks/[slug]/components/ui/TaskStatusPill'
import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { formatTaskBudgetPaymentMethodLabel } from '@/app/(task)/tasks/[slug]/helpers/taskDetailUtils'
import { TASK_DETAIL_VIEWS } from '@/app/(task)/tasks/[slug]/views'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { formatOrderAgreedPrice } from '@/utils/orderHelpers'
import { formatPrice } from '@/utils/price'
import { formatTimeSlotLabel } from '@/utils/timeSlots'

import bag from '../i11n.json'
import { PIN_VIEWS, getBottomPinView, getThreadPinView } from '../views'
import { QuoteStatusBadge } from './ThreadQuote'

const PIN_PX = { base: 4, lg: 5 } as const

/** Rows before "+N more", so the pin stays compact. */
const QUOTE_ROWS = 3

/** A price, lined up in a column. */
function Price({ children }: { children: string }) {
  return (
    <Text
      as="span"
      fontSize="sm"
      fontWeight={600}
      flexShrink={0}
      fontVariantNumeric="tabular-nums"
    >
      {children}
    </Text>
  )
}

type LiveQuote = ReturnType<typeof useTaskDetail>['sortedQuotes'][number]

/** The poster's live quotes, cheapest first: worker, price and status. */
function LiveQuotes({ live }: { live: readonly LiveQuote[] }) {
  const t = useI11n(bag)
  const more = live.length - QUOTE_ROWS
  return (
    <Stack as="ul" gap={1} listStyleType="none">
      {live.slice(0, QUOTE_ROWS).map((quote) => (
        <HStack as="li" key={quote.id} gap={2} minH="24px">
          <Text fontSize="sm" lineClamp={1} flex={1} minW={0}>
            {quote.worker?.profile?.name?.trim() || t.quote.workerFallback}
          </Text>
          {quote.price ? <Price>{formatPrice(quote.price)}</Price> : null}
          <QuoteStatusBadge status={quote.status} />
        </HStack>
      ))}
      {more > 0 ? (
        <Text as="li" fontSize="xs" color="text.muted">
          {formatMessage(t.pin.more, { count: more })}
        </Text>
      ) : null}
    </Stack>
  )
}

/** The viewer's own quote: price, where it stands, then the times offered. */
function MyQuote() {
  const { myQuote } = useTaskDetail()
  const t = useI11n(bag)
  const locale = useDateLocale()
  if (!myQuote) return null
  const times = myQuote.proposedSlots
    .map((slot) => formatTimeSlotLabel(slot, locale))
    .join(' · ')
  return (
    <Stack gap={0.5}>
      <HStack gap={2} flexWrap="wrap">
        <Text fontSize="sm" fontWeight={500}>
          {t.pin.yourQuote}
        </Text>
        {myQuote.price ? <Price>{formatPrice(myQuote.price)}</Price> : null}
        <QuoteStatusBadge status={myQuote.status} />
      </HStack>
      {times ? (
        <Text fontSize="xs" color="text.muted">
          {times}
        </Text>
      ) : null}
    </Stack>
  )
}

/** The booked time, the agreed price and how they pay. */
function Booking() {
  const { myOrder } = useTaskDetail()
  const t = useI11n(bag)
  const locale = useDateLocale()
  if (!myOrder) return null
  const payment = myOrder.snapshot.paymentMethod?.trim()
  const line = [
    formatTimeSlotLabel(
      { start: myOrder.bookedStart, end: myOrder.bookedEnd },
      locale,
    ),
    formatMessage(t.pin.agreed, { price: formatOrderAgreedPrice(myOrder) }),
    payment ? formatTaskBudgetPaymentMethodLabel(payment) : null,
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <Text fontSize="sm" color="text.muted">
      {line}
    </Text>
  )
}

function PinSkeleton() {
  return (
    <HStack
      gap={2}
      px={PIN_PX}
      py={3}
      borderBottomWidth="1px"
      borderColor="border.default"
      aria-hidden
    >
      <Skeleton h="22px" w="72px" borderRadius="full" />
      <Skeleton h="16px" w="40%" borderRadius="md" />
    </HStack>
  )
}

/**
 * The top pin under a task thread's header (Thread screen v2): always the
 * live quote(s) or the booking, information only. The poster sees the live
 * quotes before booking, a worker their own quote, then both see the
 * booking, and finally its last status. No buttons: answers live in the
 * timeline's quote card and the bottom pin. Renders inside the thread's
 * `TaskDetailProvider` and reads task detail's own view.
 */
export function ThreadPin({
  attention,
}: {
  attention: ThreadFieldsFragment['attention']
}) {
  const { view, task, error, sortedQuotes } = useTaskDetail()
  const t = useI11n(bag)
  const taskView = TASK_DETAIL_VIEWS[view]
  const lines = useSummaryLines(taskView)
  const pinView = getThreadPinView(view)

  if (view === 'loading') return error ? null : <PinSkeleton />
  if (!task || !pinView) return null

  const config = PIN_VIEWS[pinView]
  // The bottom pin says what needs you; don't say it twice.
  const asking = getBottomPinView({ attention, view }) != null
  const headline = config.headline && !asking ? lines.headline : null
  // Task detail sorts the poster's quotes cheapest first.
  const live = sortedQuotes.filter(
    (quote) => quote.status === QuoteStatus.Pending,
  )
  const cheapest = live.length > 1 ? live[0].price : null
  const summary =
    config.facts === 'quotes'
      ? [
          t.pin.liveQuotes,
          cheapest
            ? formatMessage(t.pin.cheapest, { price: formatPrice(cheapest) })
            : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : headline
  const pill =
    config.pill && taskView.pill ? (
      <TaskStatusPill status={taskView.pill} size="sm" />
    ) : null

  return (
    <Stack
      data-thread-pin={pinView}
      gap={1.5}
      px={PIN_PX}
      py={2.5}
      bg="bg.surface"
      borderBottomWidth="1px"
      borderColor="border.default"
      aria-live="polite"
    >
      {pill || summary ? (
        <HStack columnGap={2} rowGap={1} flexWrap="wrap">
          {pill}
          {summary ? (
            <Text fontSize="sm" fontWeight={500}>
              {summary}
            </Text>
          ) : null}
        </HStack>
      ) : null}
      {config.facts === 'quotes' ? <LiveQuotes live={live} /> : null}
      {config.facts === 'myQuote' ? <MyQuote /> : null}
      {config.facts === 'booking' ? <Booking /> : null}
    </Stack>
  )
}
