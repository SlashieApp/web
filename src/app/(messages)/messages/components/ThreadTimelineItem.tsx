'use client'

import { Box, HStack, Stack, Text, chakra } from '@chakra-ui/react'
import { FlashKind, ThreadItemType } from '@codegen/schema'
import type { ThreadItemFieldsFragment } from '@codegen/schema'
import type { ReactNode } from 'react'
import { LuCircleAlert } from 'react-icons/lu'

import { useTaskDetail } from '@/app/(task)/tasks/[slug]/context/TaskDetailProvider'
import { useI11n } from '@/i18n/useI11n'
import { hitAreaGrowth, sdlFocusRing, sdlMotion } from '@/theme/styles'
import { formatPrice } from '@/utils/price'
import { formatTimeSlotLabel } from '@/utils/timeSlots'
import { Button, Link } from '@ui'

import { clockTime, flashAction, flashSlot } from '../helpers/messagesFormat'
import bag from '../i11n.json'
import { ThreadQuote } from './ThreadQuote'
import { useThreadSheet } from './ThreadSheetContext'

type Item = ThreadItemFieldsFragment

/** A centred card: a Slashie announcement. */
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
        <Text fontWeight={500} fontSize="sm">
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
  onOpen,
  withBody = true,
}: {
  item: Item
  time: string
  /** The booked slot, already formatted. */
  slot?: string | null
  /** False for the quote event, whose card says the rest (FE-567). */
  withBody?: boolean
  /** The request still waits on the viewer: open it in the sheet (FE-543). */
  onOpen?: () => void
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
        <Text as="span" fontWeight={500} color="text.default">
          {item.title}
        </Text>
        {price ? ` · ${price}` : null}
        {slot ? ` · ${slot}` : null}
        {time ? ` · ${time}` : null}
      </Text>
      {withBody && item.body ? (
        <Text fontSize="xs" color="text.muted" whiteSpace="pre-line">
          {item.body}
        </Text>
      ) : null}
      {action?.kind === 'review' ? (
        <Link href={action.href} fontSize="xs" fontWeight={500}>
          {t.leaveReview}
        </Link>
      ) : null}
      {onOpen ? (
        <Button
          type="button"
          size="xs"
          variant="secondary"
          mt={1}
          onClick={onOpen}
        >
          {t.sheet.openRequest}
        </Button>
      ) : null}
    </Stack>
  )
}

/** The flashes that ask the viewer something about the booking. */
const REQUEST_FLASHES: ReadonlySet<FlashKind> = new Set([
  FlashKind.RescheduleRequested,
  FlashKind.CancellationRequested,
])

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
 * worker's "quote sent" flash is its line and then the quote card, where the
 * poster accepts (no card around it, FE-567); Slashie announcements stay cards; every other event is a short line
 * (Thread screen v2), the worker's Task cancelled and Task reopened (BE-108)
 * included. Day dividers carry the date, so times are clock times; a run of
 * messages shows one (FE-291).
 */
/**
 * A message of yours the server has not confirmed (motion group B, Ryan
 * 22 Nov). It looks like any message while it is on its way; `failed` is the
 * line under it once it has not gone, with `onRetry` when a tap can send it
 * again.
 */
export type UnsentState = {
  failed: { line: string; onRetry?: () => void } | null
}

/** One line of 12/16 text; the tap area grows to 44 without adding space. */
const NOT_SENT_LINE_PX = 16

/** A message you just sent joining the conversation: a short fade and rise. */
const messageInCss = {
  animationName: 'message-in',
  animationDuration: sdlMotion.duration.base,
  animationTimingFunction: sdlMotion.easing.decelerate,
  animationFillMode: 'both',
  '@media (prefers-reduced-motion: reduce)': {
    animationName: 'step-in-fade',
  },
} as const

export function ThreadTimelineItem({
  item,
  locale,
  showTime = true,
  latestRequest = false,
  unsent,
}: {
  item: Item
  locale: string
  showTime?: boolean
  /** The newest reschedule or cancel request in the thread. */
  latestRequest?: boolean
  /** Set for a message that is still in the outbox. */
  unsent?: UnsentState
}) {
  const time = clockTime(item.createdAt, locale)
  const sheet = useThreadSheet()

  if (item.type === ThreadItemType.Flash) {
    if (item.flashKind === FlashKind.QuoteReceived && item.quote) {
      // The event as a line ("New quote · 15:03"), then the quote card on
      // its own: no card around the card (FE-567). The flash's sentence
      // ("A quote was sent on ...") names the task the header already shows.
      return (
        <Stack
          data-flash-quote=""
          alignSelf="center"
          w="full"
          maxW="420px"
          gap={1.5}
        >
          <FlashLine item={item} time={time} withBody={false} />
          <ThreadQuote quote={item.quote} />
        </Stack>
      )
    }
    if (
      item.flashKind &&
      REQUEST_FLASHES.has(item.flashKind) &&
      latestRequest &&
      !item.isMine &&
      sheet?.requestPending
    ) {
      return (
        <FlashLine
          item={item}
          time={time}
          onOpen={() => sheet.open({ kind: 'booking' })}
        />
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
  const failed = unsent?.failed ?? null
  return (
    <Stack
      alignSelf={mine ? 'flex-end' : 'flex-start'}
      maxW="80%"
      gap={1}
      align={mine ? 'flex-end' : 'flex-start'}
      data-unsent={unsent ? (failed ? 'failed' : 'sending') : undefined}
      // Only the message just written arrives in motion: the server's copy
      // takes its place without moving.
      css={unsent ? messageInCss : undefined}
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
      {failed ? (
        failed.onRetry ? (
          // The line is the way to send it again: 44 to tap, no added space.
          <chakra.button
            type="button"
            onClick={failed.onRetry}
            display="inline-flex"
            alignItems="center"
            gap={1}
            bg="transparent"
            border="none"
            cursor="pointer"
            fontSize="xs"
            lineHeight={`${NOT_SENT_LINE_PX}px`}
            fontWeight={500}
            color="status.danger.fg"
            textAlign="right"
            borderRadius="sm"
            _focusVisible={sdlFocusRing}
            {...hitAreaGrowth(NOT_SENT_LINE_PX)}
          >
            <LuCircleAlert size={14} aria-hidden style={{ flexShrink: 0 }} />
            {failed.line}
          </chakra.button>
        ) : (
          <HStack gap={1} align="flex-start" color="status.danger.fg">
            <Box as="span" mt="1px" flexShrink={0} aria-hidden>
              <LuCircleAlert size={14} />
            </Box>
            <Text fontSize="xs" lineHeight={`${NOT_SENT_LINE_PX}px`}>
              {failed.line}
            </Text>
          </HStack>
        )
      ) : showTime ? (
        <Text fontSize="xs" color="text.muted">
          {time}
        </Text>
      ) : null}
    </Stack>
  )
}
