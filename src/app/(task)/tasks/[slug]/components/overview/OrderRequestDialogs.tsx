'use client'

import { Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { OrderStatus } from '@codegen/schema'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { orderRequestView } from '@/utils/orderHelpers'
import type { TimeSlotDraft } from '@/utils/timeSlots'
import { validateTimeSlotDrafts } from '@/utils/timeSlots'
import { Modal, TimeSlotPicker } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'

/**
 * Who the booking is with, and whether a reschedule or cancellation can be
 * asked now: no request pending and before the booked start (cancel also
 * while in CONFLICT). Shared by the booking panel and the Messages menu.
 */
export function useOrderRequestOptions(): {
  counterpartName: string
  canReschedule: boolean
  canCancel: boolean
} | null {
  const { task, myOrder, me, permissions, orderClose } = useTaskDetail()
  const t = useI11n(bag)
  if (!task || !myOrder || !orderClose || !permissions.showOrderActions) {
    return null
  }
  const quote = task.quotes.find((q) => q.id === myOrder.quoteId)
  const counterpartName = permissions.isOwner
    ? quote?.worker?.profile?.name?.trim() || t.booking.yourWorkerFallback
    : task.poster?.profile?.name?.trim() || t.fallbackCustomer
  const pending = orderRequestView(myOrder, me?.id) != null
  const beforeStart = orderClose.startsAt
    ? orderClose.startsAt.getTime() > Date.now()
    : false
  const canReschedule =
    myOrder.status === OrderStatus.Active && beforeStart && !pending
  const inConflict = myOrder.status === OrderStatus.Conflict && !pending
  return {
    counterpartName,
    canReschedule,
    canCancel: canReschedule || inConflict,
  }
}

type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The other party, for the copy. */
  counterpartName: string
}

/** Propose 1–2 new times; the other party confirms one or keeps the booking. */
export function OrderRescheduleDialog({
  open,
  onOpenChange,
  counterpartName,
}: DialogProps) {
  const { runOrderAction, orderActionPending } = useTaskDetail()
  const r = useI11n(bag).requests
  const [slots, setSlots] = useState<TimeSlotDraft[]>([])
  const [showErrors, setShowErrors] = useState(false)

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setShowErrors(false)
      }}
      title={r.rescheduleTitle}
      size="lg"
      cancelLabel={r.keepBooking}
      submitLabel={r.rescheduleSubmit}
      submitLoading={orderActionPending === 'requestReschedule'}
      onSubmit={() => {
        const drafts = slots.length > 0 ? slots : []
        if (
          drafts.length === 0 ||
          validateTimeSlotDrafts(drafts).some((error) => error != null)
        ) {
          setShowErrors(true)
          return
        }
        void runOrderAction({ type: 'requestReschedule', slots: drafts }).then(
          (ok) => {
            if (!ok) return
            setSlots([])
            setShowErrors(false)
            onOpenChange(false)
          },
        )
      }}
    >
      <Stack gap={4}>
        <Text fontSize="sm" color="text.muted">
          {formatMessage(r.rescheduleBody, { name: counterpartName })}
        </Text>
        <TimeSlotPicker
          value={slots}
          onChange={setSlots}
          showErrors={showErrors}
        />
      </Stack>
    </Modal>
  )
}

/** Ask the other party to cancel (before the booked start, or in CONFLICT). */
export function OrderCancelDialog({
  open,
  onOpenChange,
  counterpartName,
}: DialogProps) {
  const { runOrderAction, orderActionPending } = useTaskDetail()
  const r = useI11n(bag).requests

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={r.cancelTitle}
      size="sm"
      cancelLabel={r.keepBooking}
      submitLabel={r.cancelSubmit}
      submitLoading={orderActionPending === 'requestCancellation'}
      onSubmit={() => {
        void runOrderAction({ type: 'requestCancellation' }).then((ok) => {
          if (ok) onOpenChange(false)
        })
      }}
    >
      <Text fontSize="sm" color="text.muted">
        {formatMessage(r.cancelBody, { name: counterpartName })}
      </Text>
    </Modal>
  )
}
