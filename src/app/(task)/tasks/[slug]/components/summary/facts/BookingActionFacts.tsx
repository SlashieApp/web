'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { OrderStatus } from '@codegen/schema'
import { useState } from 'react'

import { ReportControl } from '@/content/trust/ReportControl'
import { useI11n } from '@/i18n/useI11n'
import { SAFETY_HREF } from '@/utils/appRoutes'
import { orderRequestView } from '@/utils/orderHelpers'
import { formatTimeSlotLabel, isTimeSlotPast } from '@/utils/timeSlots'
import { Button, Link } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import bag from '../../../i11n.json'
import { OrderCloseControls } from '../../overview/OrderCloseControls'
import {
  OrderCancelDialog,
  OrderRescheduleDialog,
  useOrderRequestOptions,
} from '../../overview/OrderRequestDialogs'
import { useDateLocale } from './TaskFacts'

/**
 * A pending reschedule or cancellation and its answer buttons. The headline
 * already says who asked, so only the times and the buttons show here.
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
        <Box>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() =>
              void runOrderAction({
                type: request.mine
                  ? 'cancelRescheduleRequest'
                  : 'declineReschedule',
              })
            }
          >
            {request.mine ? r.withdraw : r.declineReschedule}
          </Button>
        </Box>
      </Stack>
    )
  }

  return (
    <Stack gap={2} py={3}>
      {myOrder.status === OrderStatus.Conflict ? null : (
        <Text fontSize="sm" color="text.muted">
          {r.lapseNote}
        </Text>
      )}
      <HStack gap={2} flexWrap="wrap">
        {request.mine ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() =>
              void runOrderAction({ type: 'withdrawCancellation' })
            }
          >
            {r.withdraw}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              size="sm"
              variant="primary"
              disabled={busy}
              loading={orderActionPending === 'acceptCancellation'}
              onClick={() =>
                void runOrderAction({ type: 'acceptCancellation' })
              }
            >
              {r.acceptCancel}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={busy}
              onClick={() =>
                void runOrderAction({ type: 'declineCancellation' })
              }
            >
              {r.declineCancel}
            </Button>
          </>
        )}
      </HStack>
    </Stack>
  )
}

/** Before the booked start: Reschedule and Cancel booking. */
export function BookingActionsFact() {
  const { orderActionPending } = useTaskDetail()
  const r = useI11n(bag).requests
  const options = useOrderRequestOptions()
  const [dialog, setDialog] = useState<'reschedule' | 'cancel' | null>(null)
  if (!options?.canReschedule) return null
  const busy = orderActionPending != null

  return (
    <HStack gap={2} flexWrap="wrap" py={3}>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={busy}
        onClick={() => setDialog('reschedule')}
      >
        {r.reschedule}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        disabled={busy}
        onClick={() => setDialog('cancel')}
      >
        {r.cancelBooking}
      </Button>
      <OrderRescheduleDialog
        open={dialog === 'reschedule'}
        onOpenChange={(open) => setDialog(open ? 'reschedule' : null)}
        counterpartName={options.counterpartName}
      />
      <OrderCancelDialog
        open={dialog === 'cancel'}
        onOpenChange={(open) => setDialog(open ? 'cancel' : null)}
        counterpartName={options.counterpartName}
      />
    </HStack>
  )
}

/** Conflict: Safety and help, Report, and Ask to cancel. */
export function ConflictActionsFact() {
  const { myOrder, permissions, orderActionPending } = useTaskDetail()
  const k = useI11n(bag).conflict
  const options = useOrderRequestOptions()
  const [cancelOpen, setCancelOpen] = useState(false)
  if (!myOrder || !options) return null

  return (
    <HStack gap={2} flexWrap="wrap" py={3}>
      <Button asChild variant="secondary" size="sm">
        <Link href={SAFETY_HREF} _hover={{ textDecoration: 'none' }}>
          {k.help}
        </Link>
      </Button>
      <ReportControl
        kind="user"
        targetId={
          permissions.isOwner ? myOrder.workerUserId : myOrder.customerUserId
        }
        targetTitle={options.counterpartName}
        variant="button"
      />
      {options.canCancel ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={orderActionPending != null}
          onClick={() => setCancelOpen(true)}
        >
          {k.askToCancel}
        </Button>
      ) : null}
      <OrderCancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        counterpartName={options.counterpartName}
      />
    </HStack>
  )
}

/** After marking Done or Failed: switch to the other choice. */
export function CloseSwitchFact() {
  const { orderClose } = useTaskDetail()
  if (!orderClose?.canClose || !orderClose.mine) return null
  return (
    <Box py={3}>
      <OrderCloseControls />
    </Box>
  )
}
