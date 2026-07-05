'use client'

import { Stack } from '@chakra-ui/react'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { OrderSection } from '../../orderSection/OrderSection'
import {
  AcceptedWorkerStatus,
  CustomerActiveOrderStatus,
} from '../../statusSection'

/**
 * Booking section — the "Your booking" info for an active order (completion code
 * for the customer; job + complete-with-code for the worker) and the order
 * summary once closed. It's a normal section card placed inside the existing
 * layout (not a full-width banner). Renders nothing for OPEN / CANCELLED.
 * Order data is client-fetched (TaskViewer) and read from context.
 */
export function BookingSection() {
  const { task, myOrder, permissions } = useTaskDetail()
  if (!task) return null

  if (permissions.isClosed) {
    return myOrder ? <OrderSection task={task} order={myOrder} /> : null
  }

  const hasBooking =
    permissions.showCustomerCompletionCode ||
    permissions.showWorkerJobBanner ||
    permissions.showCompleteWithCode
  if (!hasBooking) return null

  return (
    // `task-order`: anchor target for "Open job details" links (quote accept
    // redirect + the Quotes module W6 state).
    <Stack gap={4} w="full" id="task-order" scrollMarginTop="96px">
      <CustomerActiveOrderStatus />
      <AcceptedWorkerStatus />
    </Stack>
  )
}
