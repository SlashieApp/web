'use client'

import { Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { Button, SlideToConfirm } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'
import { OrderFailedDialog } from './OrderFailedDialog'

/**
 * Mutual close for the viewer once the booked time has started. Before
 * they act: slide Done or "something went wrong". After they act, and until
 * the other party does, they can switch to the other choice.
 */
export function OrderCloseControls() {
  const { orderClose, runOrderAction, orderActionPending } = useTaskDetail()
  const c = useI11n(bag).close
  const [failedOpen, setFailedOpen] = useState(false)

  if (!orderClose?.canClose) return null
  const { mine } = orderClose
  const busy = orderActionPending != null

  const slide = (
    <SlideToConfirm
      label={c.slideDone}
      armedLabel={c.tapAgainDone}
      loading={orderActionPending === 'markDone'}
      disabled={busy && orderActionPending !== 'markDone'}
      onConfirm={() => void runOrderAction({ type: 'markDone' })}
    />
  )
  const failed = (label: string) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      alignSelf="center"
      color="text.muted"
      disabled={busy}
      onClick={() => setFailedOpen(true)}
    >
      {label}
    </Button>
  )

  return (
    <Stack gap={2} w="full">
      {mine === 'DONE' ? (
        failed(c.switchToFailed)
      ) : (
        <>
          {mine === 'FAILED' ? (
            <Text fontSize="sm" color="text.muted">
              {c.switchToDone}
            </Text>
          ) : null}
          {slide}
          <Text fontSize="xs" color="text.muted" textAlign="center">
            {c.doneMeaning}
          </Text>
          {mine == null ? failed(c.somethingWrong) : null}
        </>
      )}
      <OrderFailedDialog open={failedOpen} onOpenChange={setFailedOpen} />
    </Stack>
  )
}
