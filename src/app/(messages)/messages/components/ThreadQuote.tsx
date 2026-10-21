'use client'

import { useMutation } from '@apollo/client/react'
import { HStack, Stack, Text } from '@chakra-ui/react'
import type {
  AcceptQuoteMutation,
  DeclineQuoteMutation,
  QuoteStatus,
  ThreadItemFieldsFragment,
} from '@codegen/schema'

import { useUserStore } from '@/app/(auth)/store/user'
import { useMessagesOptional } from '@/app/(messages)/messages/context/MessagesProvider'
import MessageThread from '@/app/(messages)/messages/graphql/MessageThread.gql'
import { useAcceptQuoteDialog } from '@/app/(task)/tasks/[slug]/components/quotes/useAcceptQuoteSafety'
import AcceptQuote from '@/app/(task)/tasks/[slug]/graphql/AcceptQuote.gql'
import DeclineQuote from '@/app/(task)/tasks/[slug]/graphql/DeclineQuote.gql'
import Task from '@/app/(task)/tasks/[slug]/graphql/Task.gql'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { formatPrice } from '@/utils/price'
import { formatTimeSlotLabel } from '@/utils/timeSlots'
import { Avatar, Badge, Button } from '@ui'

import {
  type QuoteFlashStatus,
  quoteFlashStatus,
} from '../helpers/messagesFormat'
import bag from '../i11n.json'

type FlashQuote = NonNullable<ThreadItemFieldsFragment['quote']>

const STATUS_BADGE: Record<
  QuoteFlashStatus,
  'neutral' | 'success' | 'warning'
> = {
  pending: 'warning',
  accepted: 'success',
  declined: 'neutral',
  notSelected: 'neutral',
  withdrawn: 'neutral',
  replaced: 'neutral',
}

/** Where a quote stands (Awaiting reply, Accepted, Not selected...). */
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
 * proposed times and its live status. The task owner accepts (picking a
 * time, with the safety notice) or declines a pending quote right here.
 */
export function ThreadQuote({
  quote,
  locale,
}: {
  quote: FlashQuote
  locale: string
}) {
  const t = useI11n(bag)
  const q = t.quote
  const meId = useUserStore((s) => s.me?.id ?? null)
  const messages = useMessagesOptional()
  // The task behind the pins too, so the top pin shows the booking (FE-333).
  const refetchQueries = [MessageThread, Task]
  const [accept, { loading: accepting }] = useMutation<AcceptQuoteMutation>(
    AcceptQuote,
    { refetchQueries },
  )
  const [decline, { loading: declining }] = useMutation<DeclineQuoteMutation>(
    DeclineQuote,
    { refetchQueries },
  )

  const status = quoteFlashStatus(quote.status)
  // Only the owner and the quoting worker can see the quote.
  const canAct =
    status === 'pending' && meId != null && quote.workerUserId !== meId
  const name = quote.worker.profile.name?.trim() || q.workerFallback
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
        title: getFriendlyErrorMessage(error, q.acceptFailed),
        type: 'error',
      })
    }
  }

  const onDecline = async () => {
    try {
      const result = await decline({ variables: { quoteId: quote.id } })
      if (!result.data?.declineQuote?.id) throw new Error(q.declineFailed)
      showAppToast({
        title: q.declinedToast,
        description: q.declinedToastHint,
        type: 'info',
      })
      trackFlowSucceeded(EVENTS.quote_decline_success, extra)
      messages?.refetchThreads()
    } catch (error) {
      trackFlowFailed(EVENTS.quote_decline_fail, error, {
        flow: 'quote_decline',
        action: 'declineFromMessages',
        operation: 'DeclineQuote',
        extra,
      })
      showAppToast({
        title: getFriendlyErrorMessage(error, q.declineFailed),
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
          src={quote.worker.profile.avatarUrl ?? undefined}
        />
        <Stack gap={0} flex={1} minW={0}>
          <Text fontWeight={600} fontSize="sm" truncate>
            {name}
          </Text>
          {canAct ? null : (
            <HStack>
              <QuoteStatusBadge status={quote.status} />
            </HStack>
          )}
        </Stack>
        {quote.price ? (
          <Text
            fontWeight={700}
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
            variant="ghost"
            loading={declining}
            disabled={accepting || declining}
            onClick={() => void onDecline()}
          >
            {q.decline}
          </Button>
          <Button
            variant="primary"
            loading={accepting}
            disabled={accepting || declining}
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
