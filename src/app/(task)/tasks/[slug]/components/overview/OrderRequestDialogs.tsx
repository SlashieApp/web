'use client'

import { useState } from 'react'

import { OrderStatus } from '@codegen/schema'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { orderRequestView } from '@/utils/orderHelpers'
import type { TimeSlotDraft } from '@/utils/timeSlots'
import { validateTimeSlotDrafts } from '@/utils/timeSlots'
import { Modal, TimeSlotPicker } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { orderCounterpart } from '../../helpers/taskDetailUtils'
import bag from '../../i11n.json'
import { ConfirmDialog } from './TaskConfirmDialogs'

/**
 * Who the booking is with, and what can be asked or done now. Shared by the
 * task's Help & actions and the Messages thread.
 *
 * - `cancelOnOwn`: either party may end the booking on their own until 24
 *   hours before the booked start (`oneSidedCancelUntil`, BE-125), even with
 *   a request pending.
 * - `canCancel`: that, or (inside the last 24 hours, or in CONFLICT) ask the
 *   other party to cancel, with no request pending and before the start.
 * - `canReschedule`: propose new times, with no request pending and before
 *   the start.
 * - `canCounterPropose`: they asked to move it: propose other times, which
 *   replace theirs (BE-125). There is no rejecting a reschedule.
 */
export function useOrderRequestOptions(): {
  counterpartName: string
  canReschedule: boolean
  canCancel: boolean
  cancelOnOwn: boolean
  canCounterPropose: boolean
} | null {
  const { task, myOrder, me, permissions, orderClose } = useTaskDetail()
  const t = useI11n(bag)
  if (!task || !myOrder || !orderClose || !permissions.showOrderActions) {
    return null
  }
  const counterpartName = orderCounterpart(
    task,
    myOrder,
    permissions.isOwner,
    t,
  ).name
  const request = orderRequestView(myOrder, me?.id)
  const pending = request != null
  const now = Date.now()
  const beforeStart = orderClose.startsAt
    ? orderClose.startsAt.getTime() > now
    : false
  const canReschedule =
    myOrder.status === OrderStatus.Active && beforeStart && !pending
  const inConflict = myOrder.status === OrderStatus.Conflict && !pending
  const cancelOnOwn = myOrder.oneSidedCancelUntil
    ? new Date(myOrder.oneSidedCancelUntil).getTime() > now
    : false
  const canCounterPropose =
    request?.kind === 'RESCHEDULE' &&
    !request.mine &&
    myOrder.status === OrderStatus.Rescheduling &&
    beforeStart
  return {
    counterpartName,
    canReschedule,
    canCancel: canReschedule || inConflict || cancelOnOwn,
    cancelOnOwn,
    canCounterPropose,
  }
}

type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The other party, for the copy. */
  counterpartName: string
}

/**
 * Propose 1–2 new times; the other party picks one or proposes others. As a
 * counter-proposal (`counter`: they asked to move it) the new times replace
 * theirs (BE-125).
 */
export function OrderRescheduleDialog({
  open,
  onOpenChange,
  counterpartName,
  counter = false,
}: DialogProps & { counter?: boolean }) {
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
      title={counter ? r.counterTitle : r.rescheduleTitle}
      description={formatMessage(counter ? r.counterBody : r.rescheduleBody, {
        name: counterpartName,
      })}
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
      <TimeSlotPicker
        value={slots}
        onChange={setSlots}
        showErrors={showErrors}
      />
    </Modal>
  )
}

/**
 * Cancel the booking. Until 24 hours before the booked start either party
 * ends it on their own (BE-125), behind a warning that it ends the booking
 * for both and cannot be undone. After that (or in CONFLICT) they ask the
 * other party, who accepts or keeps the booking.
 */
export function OrderCancelDialog({
  open,
  onOpenChange,
  counterpartName,
}: DialogProps) {
  const { runOrderAction, orderActionPending } = useTaskDetail()
  const onOwn = useOrderRequestOptions()?.cancelOnOwn ?? false
  const r = useI11n(bag).requests

  if (onOwn) {
    return (
      <ConfirmDialog
        open={open}
        onOpenChange={onOpenChange}
        title={r.cancelNowTitle}
        body={formatMessage(r.cancelNowBody, { name: counterpartName })}
        keepLabel={r.keepBooking}
        confirmLabel={r.cancelNowSubmit}
        busy={orderActionPending === 'cancelOrder'}
        onConfirm={() => runOrderAction({ type: 'cancelOrder' })}
      />
    )
  }
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={r.cancelTitle}
      body={formatMessage(r.cancelBody, { name: counterpartName })}
      keepLabel={r.keepBooking}
      confirmLabel={r.cancelSubmit}
      busy={orderActionPending === 'requestCancellation'}
      onConfirm={() => runOrderAction({ type: 'requestCancellation' })}
    />
  )
}
