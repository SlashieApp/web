'use client'

import { useBreakpointValue } from '@chakra-ui/react'
import type { TaskQuery } from '@codegen/schema'

import type { TaskDetailRecord } from '../../helpers/taskDetailUtils'
import { TaskDetailMobile } from './TaskDetailMobile'
import { TaskDetailView } from './openTask/TaskDetailView'

type TaskTripDetailProps = {
  task: TaskDetailRecord
  order: NonNullable<TaskQuery['task']>['viewerOrder'] | null | undefined
}

/**
 * Task-detail entry. One layout per form factor, shared across every status:
 * mobile (<lg) → hero + Info/Quotes tabs; desktop (lg+) → the two-column
 * `TaskDetailView`. Section components branch on permissions internally.
 */
export function TaskTripDetail({ order }: TaskTripDetailProps) {
  const isMobile = useBreakpointValue(
    { base: true, lg: false },
    { fallback: 'base' },
  )

  if (isMobile) {
    return <TaskDetailMobile order={order} />
  }

  return <TaskDetailView order={order} />
}
