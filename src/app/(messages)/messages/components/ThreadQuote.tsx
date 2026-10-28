'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Stack, Text } from '@chakra-ui/react'
import type {
  AcceptQuoteMutation,
  QuoteStatus,
  ThreadItemFieldsFragment,
} from '@codegen/schema'

import { useUserStore } from '@/app/(auth)/store/user'
import { useMessagesOptional } from '@/app/(messages)/messages/context/MessagesProvider'
import MessageThread from '@/app/(messages)/messages/graphql/MessageThread.gql'
import { taskServerError } from '@/app/(stepflow)/tasks/create/helpers/taskFieldError'
import { useAcceptQuoteDialog } from '@/app/(task)/tasks/[slug]/components/quotes/useAcceptQuoteSafety'
import AcceptQuote from '@/app/(task)/tasks/[slug]/graphql/AcceptQuote.gql'
import Task from '@/app/(task)/tasks/[slug]/graphql/Task.gql'
import taskBag from '@/app/(task)/tasks/[slug]/i11n.json'
import { useI11n } from '@/i18n/useI11n'
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
import type { ThreadViewInput } from '../views'

type FlashQuote = NonNullable<ThreadItemFieldsFragment['quote']>

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
 * The quote on the worker's "quote sent" flash (BE-81): worker, price,
 * proposed times and its live status. The task owner accepts a pending quote
 * right here (picking a time, with the safety notice), while the task is open
 * and not suspended; a suspended worker's quote shows "Account suspended"
 * with Accept off, as on task detail (BE-108). The worker's own pending quote
 * says what the task is doing once someone else is booked or the booking
 * ended (BE-113, BE-116), not "Awaiting reply".
 */
export function ThreadQuote({
  quote,
  locale,
  taskSuspended = false,
  taskOpen = true,
  otherBooking = null,
}: {
  quote: FlashQuote
  locale: string
  /** The task is suspended (BE-108): the quote can't be answered. */
  taskSuspended?: boolean
  /**
   * The task is still open. Once someone is booked the other quotes stay
   * PENDING (BE-113), but only an open task can accept one.
   */
  taskOpen?: boolean
  /** Task detail's view says the viewer's pending quote lost the task (`threadOtherBooking`). */
  otherBooking?: ThreadViewInput['otherBooking']
}) {
  const t = useI11n(bag)
  const q = t.quote
  const taskCopy = useI11n(taskBag)
  const meId = useUserStore((s) => s.me?.id ?? null)
  const messages = useMessagesOptional()
  // The task behind the pins too, so the top pin shows the booking (FE-333).
  const refetchQueries = [MessageThread, Task]
  const [accept, { loading: accepting }] = useMutation<AcceptQuoteMutation>(
    AcceptQuote,
    { refetchQueries },
  )

  const status = quoteFlashStatus(quote.status)
  // Only the owner and the quoting worker can see the quote.
  const canAct =
    status === 'pending' &&
    meId != null &&
    quote.workerUserId !== meId &&
    !taskSuspended &&
    taskOpen
  const taskStatus = quoteCardTaskStatus({
    quoteStatus: quote.status,
    isMine: meId != null && quote.workerUserId === meId,
    otherBooking,
  })
  // The owner's pill, as on task detail's quote list.
  const workerSuspended = quote.workerSuspended && quote.workerUserId !== meId
  const name = quote.worker?.profile.name?.trim() || q.workerFallback
  const times = quote.proposedSlots
    .map((slot) => formatTimeSlotLabel(slot, locale))
    .join(' · ')
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
    <Stack
      gap={2}
      p={3}
      borderRadius="md"
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
    >
      <HStack gap={3} align="center">
        <Avatar
          size="sm"
          name={name}
          src={quote.worker?.profile.avatarUrl ?? undefined}
        />
        <Stack gap={0} flex={1} minW={0}>
          <Text fontWeight={500} fontSize="sm" truncate>
            {name}
          </Text>
          {canAct && !workerSuspended ? null : (
            <HStack gap={1.5} flexWrap="wrap">
              {canAct ? null : taskStatus ? (
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
          )}
        </Stack>
        {quote.price ? (
          <Text
            fontWeight={600}
            fontSize="lg"
            flexShrink={0}
            fontVariantNumeric="tabular-nums"
          >
            {formatPrice(quote.price)}
          </Text>
        ) : null}
      </HStack>
      {times ? (
        <Text fontSize="xs" color="text.muted">
          {times}
        </Text>
      ) : null}
      {quote.message?.trim() ? (
        <Text fontSize="sm" color="text.muted" lineClamp={3}>
          {quote.message.trim()}
        </Text>
      ) : null}
      {canAct ? (
        <HStack gap={2} justify="flex-end">
          <Button
            variant="primary"
            loading={accepting}
            disabled={accepting || workerSuspended}
            onClick={() => requestAccept(quote.id)}
          >
            {q.accept}
          </Button>
        </HStack>
      ) : null}
      {dialog}
    </Stack>
  )
}
