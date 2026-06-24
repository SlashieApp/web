'use client'

import { Stack } from '@chakra-ui/react'
import type { TaskQuery } from '@codegen/schema'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { OrderSection } from '../orderSection/OrderSection'
import { QuotesSection } from '../quoteSection/QuotesSection'
import { WorkerOrderVerificationPanel } from '../quoteSection/WorkerOrderVerificationPanel'
import {
  AcceptedWorkerStatus,
  CustomerActiveOrderStatus,
} from '../statusSection'
import { Reveal } from './Reveal'

type StateHeroProps = {
  order: NonNullable<TaskQuery['task']>['viewerOrder'] | null | undefined
}

/**
 * The single most-important module for the current state, rendered first/largest.
 * Each module already self-gates on the existing permission flags, so this only
 * decides ORDER + which family renders for the phase (see the state matrix).
 */
export function StateHero({ order }: StateHeroProps) {
  const { task, permissions } = useTaskDetail()
  if (!task) return null

  // Cancelled: the status header carries the message; details sit below.
  if (permissions.isCancelled) return null

  // Closed: completion / receipt summary (no recruitment CTA).
  if (permissions.isClosed) {
    return order ? (
      <Reveal>
        <OrderSection task={task} order={order} />
      </Reveal>
    ) : null
  }

  // OPEN + AWARDED(active): the self-gating modules pick the right hero.
  return (
    <Reveal>
      <Stack gap={4} w="full">
        <CustomerActiveOrderStatus />
        <AcceptedWorkerStatus />
        <WorkerOrderVerificationPanel />
        <QuotesSection />
      </Stack>
    </Reveal>
  )
}
