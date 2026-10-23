'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { FlashKind, ThreadItemType } from '@codegen/schema'
import type { ThreadItemFieldsFragment } from '@codegen/schema'
import { type ReactNode, useContext } from 'react'

import { TaskDetailContext } from '@/app/(task)/tasks/[slug]/context/TaskDetailContext'
import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { useI11n } from '@/i18n/useI11n'
import { formatPrice } from '@/utils/price'
import { formatTimeSlotLabel } from '@/utils/timeSlots'
import { Link } from '@ui'

import { clockTime, flashAction, flashSlot } from '../helpers/messagesFormat'
import bag from '../i11n.json'
import { ThreadQuote } from './ThreadQuote'

type Item = ThreadItemFieldsFragment

/** A centred card: the worker's quote, or a Slashie announcement. */
function FlashCard({
  item,
  time,
  children,
}: {
  item: Item
  time: string
  children?: ReactNode
}) {
  return (
    <Stack
      data-flash-card={item.flashKind ?? undefined}
      alignSelf="center"
      w="full"
      maxW="420px"
      gap={2}
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border.default"
      bg="bg.subtle"
    >
      {item.imageUrl ? (
        <Box borderRadius="md" overflow="hidden">
          <img
            src={item.imageUrl}
            alt=""
            style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }}
          />
        </Box>
      ) : null}
      <HStack justify="space-between" align="baseline" gap={3}>
        <Text fontWeight={700} fontSize="sm">
          {item.title}
        </Text>
        <Text fontSize="xs" color="text.muted" flexShrink={0}>
          {time}
        </Text>
      </HStack>
      {item.body ? (
        <Text fontSize="sm" color="text.muted" whiteSpace="pre-line">
          {item.body}
        </Text>
      ) : null}
      {children}
    </Stack>
  )
}

/** Lines that name the quote's price; others (a reschedule, say) carry the quote but not about its price. */
const QUOTE_OUTCOMES: ReadonlySet<FlashKind> = new Set([
  FlashKind.QuoteAccepted,
  FlashKind.QuoteDeclined,
  FlashKind.QuoteNotSelected,
  FlashKind.QuoteWithdrawn,
])

/**
 * Any other event as one short centred line: the flash's own title (with
 * the quote's price on quote outcomes, and the booked slot on Quote
 * accepted), its time, then its body. No card and no buttons; a review
 * prompt keeps its Leave a review link.
 */
function FlashLine({
  item,
  time,
  slot,
}: {
  item: Item
  time: string
  /** The booked slot, already formatted. */
  slot?: string | null
}) {
  const t = useI11n(bag)
  const action = flashAction(item)
  const price =
    item.flashKind && QUOTE_OUTCOMES.has(item.flashKind) && item.quote?.price
      ? formatPrice(item.quote.price)
      : null
  return (
    <Stack
      data-flash-line={item.flashKind ?? undefined}
      alignSelf="center"
      w="full"
      maxW="420px"
      gap={0.5}
      px={3}
      py={1}
      align="center"
      textAlign="center"
    >
      <Text fontSize="xs" color="text.muted">
        <Text as="span" fontWeight={700} color="text.default">
          {item.title}
        </Text>
        {price ? ` · ${price}` : null}
        {slot ? ` · ${slot}` : null}
        {time ? ` · ${time}` : null}
      </Text>
      {item.body ? (
        <Text fontSize="xs" color="text.muted" whiteSpace="pre-line">
          {item.body}
        </Text>
      ) : null}
      {action?.kind === 'review' ? (
        <Link href={action.href} fontSize="xs" fontWeight={600}>
          {t.leaveReview}
        </Link>
      ) : null}
    </Stack>
  )
}

/**
 * Quote accepted also says when the job is booked: the quote's own slot, or
 * the one the viewer's booking in task detail starts at (`flashSlot`), in
 * the same format as the top pin's booking.
 */
function AcceptedLine({
  item,
  time,
  locale,
}: {
  item: Item
  time: string
  locale: string
}) {
  const { myOrder } = useTaskDetail()
  const slot = flashSlot(item, myOrder)
  return (
    <FlashLine
      item={item}
      time={time}
      slot={slot ? formatTimeSlotLabel(slot, locale) : null}
    />
  )
}

/**
 * One timeline entry: a chat bubble (mine on the right) or a flash. Only the
 * worker's "quote sent" flash is a full quote card, where the poster accepts
 * or declines; Slashie announcements stay cards; every other event is a
 * short line (Thread screen v2), the worker's Task cancelled and Task
 * reopened (BE-108) included. Day dividers carry the date, so times are
 * clock times; a run of messages shows one (FE-291).
 */
export function ThreadTimelineItem({
  item,
  locale,
  showTime = true,
}: {
  item: Item
  locale: string
  showTime?: boolean
}) {
  const time = clockTime(item.createdAt, locale)
  // A task thread runs inside its task's provider: a suspended task's quote
  // can't be answered (BE-108).
  const taskSuspended = Boolean(
    useContext(TaskDetailContext)?.permissions.isSuspended,
  )

  if (item.type === ThreadItemType.Flash) {
    if (item.flashKind === FlashKind.QuoteReceived && item.quote) {
      return (
        <FlashCard item={item} time={time}>
          <ThreadQuote
            quote={item.quote}
            locale={locale}
            taskSuspended={taskSuspended}
          />
        </FlashCard>
      )
    }
    if (item.flashKind === FlashKind.SystemAnnouncement) {
      return <FlashCard item={item} time={time} />
    }
    if (item.flashKind === FlashKind.QuoteAccepted) {
      return <AcceptedLine item={item} time={time} locale={locale} />
    }
    return <FlashLine item={item} time={time} />
  }

  const mine = item.isMine
  return (
    <Stack
      alignSelf={mine ? 'flex-end' : 'flex-start'}
      maxW="80%"
      gap={1}
      align={mine ? 'flex-end' : 'flex-start'}
    >
      <Box
        px={3.5}
        py={2}
        borderRadius="xl"
        borderBottomRightRadius={mine ? 'sm' : 'xl'}
        borderBottomLeftRadius={mine ? 'xl' : 'sm'}
        bg={mine ? 'action.primary' : 'bg.subtle'}
        color={mine ? 'text.onGreen' : 'text.default'}
      >
        <Text fontSize="sm" whiteSpace="pre-wrap" wordBreak="break-word">
          {item.body}
        </Text>
      </Box>
      {showTime ? (
        <Text fontSize="xs" color="text.muted">
          {time}
        </Text>
      ) : null}
    </Stack>
  )
}
