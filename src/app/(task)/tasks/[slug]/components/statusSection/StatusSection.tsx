'use client'

import { Stack } from '@chakra-ui/react'

import { AcceptedWorkerStatus } from './AcceptedWorkerStatus'
import { CustomerActiveOrderStatus } from './CustomerActiveOrderStatus'

/** Live order status for customer and worker when a booking is in progress. */
export function StatusSection() {
  return (
    <Stack gap={4} w="full">
      <CustomerActiveOrderStatus />
      <AcceptedWorkerStatus />
    </Stack>
  )
}
