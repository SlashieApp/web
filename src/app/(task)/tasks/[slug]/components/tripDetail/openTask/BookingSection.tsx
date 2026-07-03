'use client'

import type { OrderItem } from '@/utils/orderHelpers'
import { Stack } from '@chakra-ui/react'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { OrderSection } from '../../orderSection/OrderSection'
import {
  AcceptedWorkerStatus,
  CustomerActiveOrderStatus,
} from '../../statusSection'

type BookingSectionProps = {
  order: OrderItem | null | undefined
}

/**
 * Booking section — the "Your booking" info for an active order (completion code
 * for the customer; job + complete-with-code for the worker) and the order
 * summary once closed. It's a normal section card placed inside the existing
 * layout (not a full-width banner). Renders nothing for OPEN / CANCELLED.
 */
export function BookingSection({ order }: BookingSectionProps) {
  const { task, permissions } = useTaskDetail()
  if (!task) return null

  if (permissions.isClosed) {
    return order ? <OrderSection task={task} order={order} /> : null
  }

  const hasBooking =
    permissions.showCustomerCompletionCode ||
    permissions.showWorkerJobBanner ||
    permissions.showCompleteWithCode
  if (!hasBooking) return null

  return (
    <Stack gap={4} w="full">
      <CustomerActiveOrderStatus />
      <AcceptedWorkerStatus />
    </Stack>
  )
}
