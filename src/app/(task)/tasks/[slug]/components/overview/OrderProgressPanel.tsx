'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { OrderStatus } from '@codegen/schema'
import { useState } from 'react'

import { ReportControl } from '@/content/trust/ReportControl'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { SAFETY_HREF } from '@/utils/appRoutes'
import { orderRequestView } from '@/utils/orderHelpers'
import { formatTimeSlotLabel, isTimeSlotPast } from '@/utils/timeSlots'
import { Button, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'
import { OrderCloseControls } from './OrderCloseControls'
import {
  OrderCancelDialog,
  OrderRescheduleDialog,
  useOrderRequestOptions,
} from './OrderRequestDialogs'

/**
 * Where the booking stands for either party: booked time, a pending
 * reschedule or cancellation, Done/Failed progress (with the 7-day
 * auto-Done), CONFLICT next steps, and the reschedule/cancel entry points.
 * Slide-to-Done itself lives on the main CTA until the viewer acts.
 */
export function OrderProgressPanel() {
  const {
    task,
    myOrder,
    me,
    permissions,
    orderClose,
    runOrderAction,
    orderActionPending,
    jobActionError,
  } = useTaskDetail()
  const t = useI11n(bag)
  const locale = useLocale() === 'zh-hk' ? 'zh-HK' : 'en-GB'
  const requestOptions = useOrderRequestOptions()
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  if (!task || !myOrder || !orderClose || !permissions.showOrderActions) {
    return null
  }

  const c = t.close
  const r = t.requests
  const k = t.conflict
  const quote = task.quotes.find((q) => q.id === myOrder.quoteId)
  const name = permissions.isOwner
    ? quote?.worker?.profile?.name?.trim() || t.booking.yourWorkerFallback
    : task.poster?.profile?.name?.trim() || t.fallbackCustomer
  const counterpartId = permissions.isOwner
    ? myOrder.workerUserId
    : myOrder.customerUserId
  const request = orderRequestView(myOrder, me?.id)
  const conflict = myOrder.status === OrderStatus.Conflict
  const beforeStart = orderClose.startsAt
    ? orderClose.startsAt.getTime() > Date.now()
    : false
  const booked = formatTimeSlotLabel(
    { start: myOrder.bookedStart, end: myOrder.bookedEnd },
    locale,
  )
  const busy = orderActionPending != null
  const { mine, theirs, autoDoneAt } = orderClose

  let closeLine: string | null = null
  if (!conflict && !request) {
    if (myOrder.status === OrderStatus.Active && beforeStart) {
      closeLine = formatMessage(c.startsAt, { time: booked })
    } else if (orderClose.canClose) {
      closeLine =
        mine === 'DONE'
          ? c.youDone
          : mine === 'FAILED'
            ? c.youFailed
            : theirs === 'DONE'
              ? c.theyDone
              : theirs === 'FAILED'
                ? c.theyFailed
                : c.readyBody
    }
  }
  const oneSidedDone =
    (mine === 'DONE' && !theirs) || (theirs === 'DONE' && !mine)
  const autoDoneLine =
    autoDoneAt && oneSidedDone && !conflict
      ? formatMessage(c.autoDone, {
          date: autoDoneAt.toLocaleDateString(locale, {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          }),
        })
      : null
  const canRequest = Boolean(requestOptions?.canReschedule)

  return (
    <Stack
      gap={3}
      borderTopWidth="1px"
      borderColor="border.default"
      pt={4}
      aria-live="polite"
    >
      <Text fontWeight={700}>
        {formatMessage(c.bookedFor, { time: booked })}
      </Text>

      {conflict ? (
        <Stack
          gap={2}
          p={4}
          borderRadius="lg"
          bg="status.warning.soft"
          borderWidth="1px"
          borderColor="border.default"
        >
          <Text fontSize="xs" fontWeight={700} color="status.warning.fg">
            {k.eyebrow}
          </Text>
          <Text fontWeight={700}>{k.heading}</Text>
          <Text fontSize="sm" color="text.muted">
            {formatMessage(k.body, { name })}
          </Text>
          <HStack gap={2} flexWrap="wrap">
            <Button asChild variant="secondary" size="sm">
              <Link href={SAFETY_HREF} _hover={{ textDecoration: 'none' }}>
                {k.help}
              </Link>
            </Button>
            <ReportControl
              kind="user"
              targetId={counterpartId}
              targetTitle={name}
              variant="button"
            />
            {!request ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => setCancelOpen(true)}
              >
                {k.askToCancel}
              </Button>
            ) : null}
          </HStack>
        </Stack>
      ) : null}

      {request?.kind === 'RESCHEDULE' ? (
        <Stack gap={2}>
          <Text fontSize="sm">
            {formatMessage(
              request.mine ? r.youRescheduled : r.theyRescheduled,
              {
                name,
              },
            )}
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
                <Text
                  fontSize="sm"
                  color={past ? 'text.muted' : 'text.default'}
                >
                  {formatTimeSlotLabel(slot, locale)}
                  {past ? ` · ${t.quotes.pastSlot}` : ''}
                </Text>
                {!request.mine ? (
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
      ) : null}

      {request?.kind === 'CANCEL' ? (
        <Stack gap={2}>
          <Text fontSize="sm">
            {formatMessage(request.mine ? r.youCancelled : r.theyCancelled, {
              name,
            })}
          </Text>
          {!conflict ? (
            <Text fontSize="sm" color="text.muted">
              {r.lapseNote}
            </Text>
          ) : null}
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
      ) : null}

      {closeLine ? (
        <Text fontSize="sm" color="text.muted">
          {formatMessage(closeLine, { name })}
        </Text>
      ) : null}
      {autoDoneLine ? (
        <Text fontSize="sm" color="text.muted">
          {autoDoneLine}
        </Text>
      ) : null}
      {orderClose.canClose && mine ? <OrderCloseControls /> : null}

      {canRequest ? (
        <HStack gap={2} flexWrap="wrap">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={busy}
            onClick={() => setRescheduleOpen(true)}
          >
            {r.reschedule}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => setCancelOpen(true)}
          >
            {r.cancelBooking}
          </Button>
        </HStack>
      ) : null}

      {jobActionError ? (
        <Text fontSize="sm" color="status.danger.fg" role="alert">
          {jobActionError}
        </Text>
      ) : null}

      <OrderRescheduleDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        counterpartName={name}
      />
      <OrderCancelDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        counterpartName={name}
      />
    </Stack>
  )
}
