'use client'

import { Stack, Text } from '@chakra-ui/react'
import { OrderFailedReason } from '@codegen/schema'
import { useId, useState } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { FormStack, Modal, RadioButton, formControlHelperTextProps } from '@ui'

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
  const noteId = useId()
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
      <FormStack>
        {/* One choice group with no label of its own (the title names it): the
            reasons 8 apart, the private note 4 under them like a helper. */}
        <Stack gap="form.controlToHelper">
          <Stack
            gap={2}
            role="radiogroup"
            aria-label={c.failedTitle}
            aria-describedby={noteId}
          >
            {reasons.map(([value, label]) => (
              <RadioButton
                key={value}
                checked={reason === value}
                label={label}
                onChange={() => setReason(value)}
              />
            ))}
          </Stack>
          <Text id={noteId} {...formControlHelperTextProps} px={1}>
            {c.failedPrivate}
          </Text>
        </Stack>
      </FormStack>
    </Modal>
  )
}
