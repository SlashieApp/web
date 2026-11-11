'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'
import { OrderStatus } from '@codegen/schema'
import { useState } from 'react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { orderRequestView } from '@/utils/orderHelpers'
import { formatTimeSlotLabel, isTimeSlotPast } from '@/utils/timeSlots'
import { Button } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import bag from '../../../i11n.json'
import {
  OrderRescheduleDialog,
  useOrderRequestOptions,
} from '../../overview/OrderRequestDialogs'
import { useDateLocale } from './TaskFacts'

/**
 * A pending reschedule or cancellation. The headline already says who asked;
 * this shows the proposed times and, for the other side, the answers: a time
 * to accept, or other times to propose (no rejecting a reschedule, BE-125);
 * accept or keep the booking for a cancel request.
 * While the booking is frozen by a suspension (BE-108) nobody can answer and
 * the lapse note goes. Withdrawing your own request is in Help & actions.
 */
export function RequestFact() {
  const { myOrder, me, permissions, runOrderAction, orderActionPending } =
    useTaskDetail()
  const t = useI11n(bag)
  const locale = useDateLocale()
  const options = useOrderRequestOptions()
  const [counterOpen, setCounterOpen] = useState(false)
  const request = myOrder ? orderRequestView(myOrder, me?.id) : null
  if (!myOrder || !request) return null
  const r = t.requests
  const busy = orderActionPending != null
  const canAnswer = !request.mine && permissions.showOrderActions

  if (request.kind === 'RESCHEDULE') {
    return (
      <Stack gap={2} py={3}>
        <Text fontSize="sm" fontWeight={500} color="text.muted">
          {t.quotes.proposedTimes}
        </Text>
        {request.proposedSlots.map((slot) => {
          const past = isTimeSlotPast(slot)
          return (
            <HStack
              key={slot.id}
              justify="space-between"
              gap={3}
              p={3}
              borderRadius="md"
              borderWidth="1px"
              borderColor="border.default"
              flexWrap="wrap"
            >
              <Text fontSize="sm" color={past ? 'text.muted' : 'text.default'}>
                {formatTimeSlotLabel(slot, locale)}
                {past ? ` · ${t.quotes.pastSlot}` : ''}
              </Text>
              {canAnswer ? (
                <Button
                  type="button"
                  size="sm"
                  variant="primary"
                  disabled={busy || past}
                  loading={orderActionPending === 'confirmReschedule'}
                  onClick={() =>
                    void runOrderAction({
                      type: 'confirmReschedule',
                      slotId: slot.id,
                    })
                  }
                >
                  {r.confirmSlot}
                </Button>
              ) : null}
            </HStack>
          )
        })}
        {canAnswer && options ? (
          // No rejecting a reschedule (BE-125): they pick a time, message,
          // or propose other times, which replace these.
          <Stack gap={2} align="flex-start">
            <Text fontSize="sm" color="text.muted">
              {formatMessage(r.answerHint, { name: options.counterpartName })}
            </Text>
            {options.canCounterPropose ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={() => setCounterOpen(true)}
              >
                {r.counterPropose}
              </Button>
            ) : null}
            <OrderRescheduleDialog
              open={counterOpen}
              onOpenChange={setCounterOpen}
              counterpartName={options.counterpartName}
              counter
            />
          </Stack>
        ) : null}
      </Stack>
    )
  }

  // A cancel request lapses at the booked time, except in CONFLICT and
  // while frozen (the lapse waits until the suspension is lifted).
  const lapse = myOrder.status !== OrderStatus.Conflict && !permissions.isFrozen
  if (!canAnswer && !lapse) return null

  return (
    <Stack gap={2} py={3}>
      {lapse ? (
        <Text fontSize="sm" color="text.muted">
          {r.lapseNote}
        </Text>
      ) : null}
      {canAnswer ? (
        <HStack gap={2} flexWrap="wrap">
          <Button
            type="button"
            size="sm"
            variant="primary"
            disabled={busy}
            loading={orderActionPending === 'acceptCancellation'}
            onClick={() => void runOrderAction({ type: 'acceptCancellation' })}
          >
            {r.acceptCancel}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => void runOrderAction({ type: 'declineCancellation' })}
          >
            {r.declineCancel}
          </Button>
        </HStack>
      ) : null}
    </Stack>
  )
}
