'use client'

import { Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { Button, Modal, SlideToConfirm } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'
import { OrderFailedDialog } from './OrderFailedDialog'

/** Slide to mark the booking Done, with what Done means. */
function SlideDone({ onMarked }: { onMarked?: () => void }) {
  const { runOrderAction, orderActionPending } = useTaskDetail()
  const c = useI11n(bag).close
  const busy = orderActionPending != null

  return (
    <>
      <SlideToConfirm
        label={c.slideDone}
        armedLabel={c.tapAgainDone}
        loading={orderActionPending === 'markDone'}
        disabled={busy && orderActionPending !== 'markDone'}
        onConfirm={() =>
          void runOrderAction({ type: 'markDone' }).then((ok) => {
            if (ok) onMarked?.()
          })
        }
      />
      <Text fontSize="xs" color="text.muted" textAlign="center">
        {c.doneMeaning}
      </Text>
    </>
  )
}

/**
 * Mutual close on the main button once the booked time has started and the
 * viewer hasn't acted: slide Done, or "something went wrong". Switching after
 * acting is in Help & actions (`OrderDoneDialog`, `OrderFailedDialog`).
 * Nothing while the booking is frozen by a suspension (BE-108).
 */
export function OrderCloseControls() {
  const { orderClose, orderActionPending, permissions } = useTaskDetail()
  const c = useI11n(bag).close
  const [failedOpen, setFailedOpen] = useState(false)

  if (!orderClose?.canClose || !permissions.showOrderActions) return null

  return (
    <Stack gap={2} w="full">
      <SlideDone />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        alignSelf="center"
        color="text.muted"
        disabled={orderActionPending != null}
        onClick={() => setFailedOpen(true)}
      >
        {c.somethingWrong}
      </Button>
      <OrderFailedDialog open={failedOpen} onOpenChange={setFailedOpen} />
    </Stack>
  )
}

/** After marking Failed: change your mind and slide to mark it Done. */
export function OrderDoneDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const c = useI11n(bag).close

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={c.switchToDone}
      size="sm"
    >
      {/* The slide is the action and "what Done means" is its helper line:
          4 under it (`formSpace.controlToHelper`), as under any control. */}
      <Stack gap="form.controlToHelper">
        <SlideDone onMarked={() => onOpenChange(false)} />
      </Stack>
    </Modal>
  )
}
