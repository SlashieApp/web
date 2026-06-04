'use client'

import { Stack } from '@chakra-ui/react'

import { AcceptedWorkerBanner } from './AcceptedWorkerBanner'
import { CustomerActiveOrderBanner } from './CustomerActiveOrderBanner'

/** Live coordination banners for customer and worker when an order is in progress. */
export function TaskDetailCoordinationBanners() {
  return (
    <Stack gap={4} w="full">
      <CustomerActiveOrderBanner />
      <AcceptedWorkerBanner />
    </Stack>
  )
}
