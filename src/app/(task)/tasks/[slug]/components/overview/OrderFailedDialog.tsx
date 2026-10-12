'use client'

import { Stack, Text } from '@chakra-ui/react'
import { OrderFailedReason } from '@codegen/schema'
import { useState } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { Modal, RadioButton } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'

/** Mark the order Failed with a reason only the viewer can see. */
export function OrderFailedDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { runOrderAction, orderActionPending } = useTaskDetail()
  const c = useI11n(bag).close
  const [reason, setReason] = useState<OrderFailedReason | null>(null)

  const reasons: Array<[OrderFailedReason, string]> = [
    [OrderFailedReason.NoShow, c.reasonNoShow],
    [OrderFailedReason.WorkNotDone, c.reasonWorkNotDone],
    [OrderFailedReason.PaymentNotSettled, c.reasonPaymentNotSettled],
    [OrderFailedReason.Other, c.reasonOther],
  ]

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={c.failedTitle}
      size="sm"
      cancelLabel={c.cancel}
      submitLabel={c.failedSubmit}
      submitDisabled={!reason}
      submitLoading={orderActionPending === 'markFailed'}
      onSubmit={() => {
        if (!reason) return
        void runOrderAction({ type: 'markFailed', reason }).then((ok) => {
          if (ok) onOpenChange(false)
        })
      }}
    >
      <Stack gap={3} role="radiogroup" aria-label={c.failedTitle}>
        {reasons.map(([value, label]) => (
          <RadioButton
            key={value}
            checked={reason === value}
            label={label}
            onChange={() => setReason(value)}
          />
        ))}
        <Text fontSize="sm" color="text.muted">
          {c.failedPrivate}
        </Text>
      </Stack>
    </Modal>
  )
}
