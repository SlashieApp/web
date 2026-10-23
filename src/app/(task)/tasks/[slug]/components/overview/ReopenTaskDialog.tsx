'use client'

import { Text } from '@chakra-ui/react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Modal } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'

/**
 * Asks before the owner reopens the task for quotes (BE-108). The body says
 * what happens: a booking with a suspended worker is cancelled, or a
 * cancelled task takes quotes again and the quoting workers are told.
 * It closes once reopened; a failure shows a toast and keeps it open.
 */
export function ReopenTaskDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { permissions, myOrder, onReopenTask, reopeningTask } = useTaskDetail()
  const r = useI11n(bag).reopen
  const body =
    permissions.reopen === 'booking'
      ? formatMessage(r.bookingBody, {
          name: myOrder?.counterpartySuspension?.name ?? '',
        })
      : r.cancelledBody

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={r.title}
      size="sm"
      cancelLabel={r.dismiss}
      submitLabel={r.confirm}
      submitLoading={reopeningTask}
      onSubmit={() => {
        void onReopenTask().then((reopened) => {
          if (reopened) onOpenChange(false)
        })
      }}
    >
      <Text fontSize="sm" color="text.muted">
        {body}
      </Text>
    </Modal>
  )
}
