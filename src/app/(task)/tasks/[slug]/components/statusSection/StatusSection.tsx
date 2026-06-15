'use client'

import { Stack } from '@chakra-ui/react'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_COLUMN_GAP } from '../../helpers/taskDetailLayout'

import { AcceptedWorkerStatus } from './AcceptedWorkerStatus'
import { CustomerActiveOrderStatus } from './CustomerActiveOrderStatus'

/** Live order status for customer and worker when a booking is in progress. */
export function StatusSection() {
  const { permissions } = useTaskDetail()
  const { showCustomerCompletionCode, showWorkerJobBanner } = permissions

  if (!showCustomerCompletionCode && !showWorkerJobBanner) return null

  return (
    <Stack gap={TASK_DETAIL_COLUMN_GAP} w="full">
      <CustomerActiveOrderStatus />
      <AcceptedWorkerStatus />
    </Stack>
  )
}
