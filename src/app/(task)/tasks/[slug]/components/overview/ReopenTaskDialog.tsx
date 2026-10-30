'use client'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Modal } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'

/**
 * Asks before the owner reopens the task for quotes (BE-108, BE-113). The
 * description says what happens: a live booking with a suspended worker is
 * cancelled, or the task (cancelled, or booked with a booking that was
 * cancelled) takes quotes again and the workers with pending quotes are
 * told. It closes once reopened; a failure shows a toast and keeps it open.
 */
export function ReopenTaskDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { myOrder, onReopenTask, reopeningTask } = useTaskDetail()
  const r = useI11n(bag).reopen
  // Only a live booking with a suspended worker is cancelled by reopening:
  // the API sets `canReopen` there, and nowhere else on an order.
  const body = myOrder?.counterpartySuspension?.canReopen
    ? formatMessage(r.bookingBody, {
        name: myOrder.counterpartySuspension.name,
      })
    : r.cancelledBody

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={r.title}
      description={body}
      size="sm"
      cancelLabel={r.dismiss}
      submitLabel={r.confirm}
      submitLoading={reopeningTask}
      onSubmit={() => {
        void onReopenTask().then((reopened) => {
          if (reopened) onOpenChange(false)
        })
      }}
    />
  )
}
