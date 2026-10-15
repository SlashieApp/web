'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { OrderStatus } from '@codegen/schema'

import { useI11n } from '@/i18n/useI11n'
import { orderRequestView } from '@/utils/orderHelpers'
import { formatTimeSlotLabel, isTimeSlotPast } from '@/utils/timeSlots'
import { Button } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import bag from '../../../i11n.json'
import { useDateLocale } from './TaskFacts'

/**
 * A pending reschedule or cancellation. The headline already says who asked;
 * this shows the proposed times and, for the other side, the answer buttons.
 * Withdrawing your own request is in Help & actions.
 */
export function RequestFact() {
  const { myOrder, me, runOrderAction, orderActionPending } = useTaskDetail()
  const t = useI11n(bag)
  const locale = useDateLocale()
  const request = myOrder ? orderRequestView(myOrder, me?.id) : null
  if (!myOrder || !request) return null
  const r = t.requests
  const busy = orderActionPending != null

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
              {request.mine ? null : (
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
              )}
            </HStack>
          )
        })}
        {request.mine ? null : (
          <Box>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() => void runOrderAction({ type: 'declineReschedule' })}
            >
              {r.declineReschedule}
            </Button>
          </Box>
        )}
      </Stack>
    )
  }

  const lapse = myOrder.status !== OrderStatus.Conflict
  if (request.mine && !lapse) return null

  return (
    <Stack gap={2} py={3}>
      {lapse ? (
        <Text fontSize="sm" color="text.muted">
          {r.lapseNote}
        </Text>
      ) : null}
      {request.mine ? null : (
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
      )}
    </Stack>
  )
}
