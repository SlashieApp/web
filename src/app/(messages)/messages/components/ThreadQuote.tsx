'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Stack, Text, chakra } from '@chakra-ui/react'
import type {
  AcceptQuoteMutation,
  QuoteStatus,
  ThreadItemFieldsFragment,
} from '@codegen/schema'
import { useContext, useState } from 'react'
import { LuChevronRight } from 'react-icons/lu'

import { useUserStore } from '@/app/(auth)/store/user'
import { useMessagesOptional } from '@/app/(messages)/messages/context/MessagesProvider'
import MessageThread from '@/app/(messages)/messages/graphql/MessageThread.gql'
import { taskServerError } from '@/app/(stepflow)/tasks/create/helpers/taskFieldError'
import { WithdrawQuoteDialog } from '@/app/(task)/tasks/[slug]/components/overview/TaskConfirmDialogs'
import { useAcceptQuoteDialog } from '@/app/(task)/tasks/[slug]/components/quotes/useAcceptQuoteSafety'
import { TaskDetailContext } from '@/app/(task)/tasks/[slug]/context/TaskDetailContext'
import AcceptQuote from '@/app/(task)/tasks/[slug]/graphql/AcceptQuote.gql'
import Task from '@/app/(task)/tasks/[slug]/graphql/Task.gql'
import taskBag from '@/app/(task)/tasks/[slug]/i11n.json'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlFigure, sdlFocusRing, sdlMotion } from '@/theme/styles'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { formatPrice } from '@/utils/price'
import { formatTimeSlotLabel } from '@/utils/timeSlots'
import { Avatar, Badge, Button } from '@ui'

import {
  type QuoteFlashStatus,
  quoteCardTaskStatus,
  quoteFlashStatus,
} from '../helpers/messagesFormat'
import bag from '../i11n.json'
import { type ThreadViewInput, threadOtherBooking } from '../views'
import { useThreadSheet } from './ThreadSheetContext'

export type FlashQuote = NonNullable<ThreadItemFieldsFragment['quote']>

const STATUS_BADGE: Record<
  QuoteFlashStatus,
  'neutral' | 'success' | 'warning'
> = {
  pending: 'warning',
  accepted: 'success',
  withdrawn: 'neutral',
  replaced: 'neutral',
  closed: 'neutral',
}

const CardButton = chakra('button')

/** Where a quote stands (Awaiting reply, Accepted, Withdrawn, Closed...). */
export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const label = useI11n(bag).quote.status
  const value = quoteFlashStatus(status)
  return (
    <Badge variant={STATUS_BADGE[value]} size="sm" shape="pill" dot>
      {label[value]}
    </Badge>
  )
}

/**
 * Who may do what with a quote in this thread. A task thread runs inside its
 * task's provider: a suspended task's quote can't be answered (BE-108), and
 * once someone is booked the other quotes stay PENDING but only an open task
 * can accept one (BE-113). Until the task has loaded nothing is accepted. The
 * worker's own pending quote says what the task is doing instead of "Awaiting
 * reply" (BE-116).
 */
function useQuoteState(quote: FlashQuote) {
  const detail = useContext(TaskDetailContext)
  const meId = useUserStore((s) => s.me?.id ?? null)
  const taskSuspended = Boolean(detail?.permissions.isSuspended)
  const taskOpen = detail
    ? Boolean(detail.task) && detail.permissions.isOpen
    : true
  const otherBooking: ThreadViewInput['otherBooking'] = detail
    ? threadOtherBooking(detail.view)
    : null
  const status = quoteFlashStatus(quote.status)
  const isMine = meId != null && quote.workerUserId === meId
  // Only the owner and the quoting worker can see the quote.
  const canAccept =
    status === 'pending' &&
    meId != null &&
    !isMine &&
    !taskSuspended &&
    taskOpen
  const canWithdraw =
    isMine &&
    status === 'pending' &&
    Boolean(detail?.permissions.canWithdrawQuote) &&
    detail?.myQuote?.id === quote.id
  return {
    isMine,
    canAccept,
    canWithdraw,
    taskStatus: quoteCardTaskStatus({
      quoteStatus: quote.status,
      isMine,
      otherBooking,
    }),
    // The owner's pill, as on task detail's quote list.
    workerSuspended: quote.workerSuspended && !isMine,
  }
}

/** The quote's pills: where it stands, and a suspended worker's. */
function QuoteBadges({ quote }: { quote: FlashQuote }) {
  const taskCopy = useI11n(taskBag)
  const { taskStatus, workerSuspended } = useQuoteState(quote)
  return (
    <HStack gap={1.5} flexWrap="wrap">
      {taskStatus ? (
        <Badge variant="neutral" size="sm" shape="pill" dot>
          {taskCopy.summary[taskStatus]}
        </Badge>
      ) : (
        <QuoteStatusBadge status={quote.status} />
      )}
      {workerSuspended ? (
        <Badge variant="danger" size="sm" shape="pill">
          {taskCopy.quotes.card.accountSuspended}
        </Badge>
      ) : null}
    </HStack>
  )
}

/** Avatar, name and pills, with the price on the right: the quote's head. */
function QuoteHead({
  quote,
  name,
  size,
}: {
  quote: FlashQuote
  name: string
  size: 'card' | 'sheet'
}) {
  return (
    <HStack gap={3} align="center">
      <Avatar
        size="lg"
        name={name}
        src={quote.worker?.profile.avatarUrl ?? undefined}
      />
      <Stack gap={1} flex={1} minW={0}>
        <Text
          fontSize="15px"
          lineHeight="20px"
          fontWeight={500}
          letterSpacing="-0.01em"
          truncate
        >
          {name}
        </Text>
        <QuoteBadges quote={quote} />
      </Stack>
      {quote.price ? (
        <Text
          as="span"
          flexShrink={0}
          fontSize={size === 'sheet' ? '22px' : '18px'}
          lineHeight={size === 'sheet' ? '28px' : '24px'}
          color="text.default"
          {...sdlFigure}
        >
          {formatPrice(quote.price)}
        </Text>
      ) : null}
    </HStack>
  )
}

/**
 * The worker's "quote sent" flash as a card (FE-543), in the Home "Compare
 * quotes" language: avatar, name, where it stands, the price, and the message
 * on one line. The whole card opens the quote in the thread's sheet, where
 * the poster accepts it and the worker can withdraw it. Without a sheet (no
 * task behind the thread) it is only a card.
 */
export function ThreadQuote({ quote }: { quote: FlashQuote }) {
  const t = useI11n(bag)
  const sheet = useThreadSheet()
  const { isMine } = useQuoteState(quote)
  const name = quote.worker?.profile.name?.trim() || t.quote.workerFallback
  const price = quote.price ? formatPrice(quote.price) : ''
  const note = quote.message?.trim()
  const body = (
    <>
      <QuoteHead quote={quote} name={name} size="card" />
      {note ? (
        <Text mt={2.5} fontSize="sm" color="text.muted" lineClamp={1}>
          {note}
        </Text>
      ) : null}
    </>
  )
  const frame = {
    display: 'block',
    w: 'full',
    p: 3,
    textAlign: 'start',
    bg: 'bg.surface',
    borderRadius: 'lg',
    borderWidth: '1px',
    borderColor: 'border.default',
  } as const

  if (!sheet) {
    return (
      <Stack gap={0} data-thread-quote={quote.id} {...frame}>
        {body}
      </Stack>
    )
  }
  return (
    <CardButton
      type="button"
      data-thread-quote={quote.id}
      aria-label={formatMessage(
        isMine ? t.sheet.openMyQuote : t.sheet.openQuote,
        {
          name,
          price,
        },
      )}
      onClick={() => sheet.open({ kind: 'quote', quote })}
      cursor="pointer"
      position="relative"
      transitionProperty="border-color"
      transitionDuration={sdlMotion.duration.moderate}
      css={{
        touchAction: 'manipulation',
        '&:hover': { borderColor: 'border.hover' },
        '&:focus-visible': sdlFocusRing,
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
      {...frame}
    >
      {body}
      <chakra.span
        aria-hidden
        position="absolute"
        right={3}
        bottom={3}
        display="inline-flex"
        color="text.subtle"
      >
        <LuChevronRight size={16} />
      </chakra.span>
    </CardButton>
  )
}

/**
 * A quote in the thread's sheet (FE-543): the whole quote (worker, where it
 * stands, price, the times offered and the message), then its action: the
 * poster's Accept (a time to pick and the safety notice first, as on task
 * detail), or the worker's own Withdraw quote while it is pending.
 */
export function QuoteSheetBody({
  quote,
  locale,
  onDone,
}: {
  quote: FlashQuote
  locale: string
  /** Closes the sheet once the quote is accepted or withdrawn. */
  onDone: () => void
}) {
  const t = useI11n(bag)
  const q = t.quote
  const taskCopy = useI11n(taskBag)
  const messages = useMessagesOptional()
  const { canAccept, canWithdraw, workerSuspended } = useQuoteState(quote)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  // The task behind the pins too, so the top pin shows the booking (FE-333).
  const [accept, { loading: accepting }] = useMutation<AcceptQuoteMutation>(
    AcceptQuote,
    { refetchQueries: [MessageThread, Task] },
  )
  const name = quote.worker?.profile.name?.trim() || q.workerFallback
  const extra = {
    task_id: quote.taskId,
    quote_id: quote.id,
    surface: 'messages',
  }

  const onAccept = async (quoteId: string, selectedSlotId: string) => {
    try {
      const result = await accept({
        variables: { input: { quoteId, selectedSlotId } },
      })
      const orderId = result.data?.acceptQuote?.order?.id
      if (!orderId) throw new Error(q.acceptFailed)
      showAppToast({
        title: q.acceptedToast,
        description: q.acceptedToastHint,
        type: 'success',
      })
      trackFlowSucceeded(EVENTS.quote_accept_success, {
        ...extra,
        order_id: orderId,
      })
      messages?.refetchThreads()
      onDone()
    } catch (error) {
      trackFlowFailed(EVENTS.quote_accept_fail, error, {
        flow: 'quote_accept',
        action: 'acceptFromMessages',
        operation: 'AcceptQuote',
        extra,
      })
      showAppToast({
        title: taskServerError(taskCopy.serverErrors, error, q.acceptFailed),
        type: 'error',
      })
    }
  }

  const { requestAccept, dialog } = useAcceptQuoteDialog({
    quotes: [quote],
    onAccept,
    acceptingQuoteId: accepting ? quote.id : null,
  })

  return (
    <Stack gap={5} pb={2} data-quote-sheet={quote.id}>
      <QuoteHead quote={quote} name={name} size="sheet" />
      {quote.proposedSlots.length > 0 ? (
        <Stack gap={2}>
          <Text textStyle="label-md" color="text.muted">
            {t.sheet.proposedTimes}
          </Text>
          <Stack as="ul" gap={1.5} listStyleType="none">
            {quote.proposedSlots.map((slot) => (
              <Text as="li" key={slot.id} fontSize="sm">
                {formatTimeSlotLabel(slot, locale)}
              </Text>
            ))}
          </Stack>
        </Stack>
      ) : null}
      {quote.message?.trim() ? (
        <Stack gap={2}>
          <Text textStyle="label-md" color="text.muted">
            {t.sheet.message}
          </Text>
          <Text fontSize="sm" whiteSpace="pre-wrap" wordBreak="break-word">
            {quote.message.trim()}
          </Text>
        </Stack>
      ) : null}
      {canAccept ? (
        <Button
          variant="primary"
          size="form"
          w="full"
          loading={accepting}
          disabled={accepting || workerSuspended}
          onClick={() => requestAccept(quote.id)}
        >
          {q.accept}
        </Button>
      ) : null}
      {canWithdraw ? (
        <Button
          variant="secondary"
          size="form"
          w="full"
          onClick={() => setWithdrawOpen(true)}
        >
          {taskCopy.actions.withdrawQuote}
        </Button>
      ) : null}
      {dialog}
      <WithdrawQuoteDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        onWithdrawn={onDone}
      />
    </Stack>
  )
}
