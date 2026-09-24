'use client'

import { Stack } from '@chakra-ui/react'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { AcceptedWorkerStatus } from './AcceptedWorkerStatus'
import { CustomerActiveOrderStatus } from './CustomerActiveOrderStatus'
import { OrderSection } from './OrderSection'

/**
 * Booking section — the "Your booking" info for an active order (completion code
 * for the customer; job + complete-with-code for the worker) and the order
 * summary once the job is completed or the task is closed. Completed jobs hide
 * the in-progress booking chrome and keep the agreement record.
 * Renders nothing for OPEN tasks with no order. Order data is client-fetched
 * (Task.gql) and read from context.
 */
export function BookingSection() {
  const { task, myOrder, permissions } = useTaskDetail()
  if (!task) return null

  if (permissions.isJobCompleted) {
    return myOrder ? (
      <OrderSection task={task} order={myOrder} showRecord />
    ) : null
  }

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
    <Stack gap={4} w="full" id="task-order" scrollMarginTop="140px">
      <CustomerActiveOrderStatus />
      <AcceptedWorkerStatus />
    </Stack>
  )
}
