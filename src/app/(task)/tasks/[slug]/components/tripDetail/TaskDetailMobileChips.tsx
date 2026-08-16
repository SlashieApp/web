'use client'

import { Wrap, WrapItem } from '@chakra-ui/react'

import { Badge } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  taskAvailabilityRangeLabel,
  taskBudgetDisplayLine,
  taskCategoryLabel,
  taskDetailLocationLabel,
  taskDetailShowsExactLocation,
} from '../../helpers/taskDetailUtils'
import { TaskStatusPill } from './TaskStatusPill'

/**
 * Wrapping Slashie-only metadata chips under the sticky title.
 * Status / Location / When always; Budget and Category when present.
 */
export function TaskDetailMobileChips() {
  const { task, myOrder, me, permissions } = useTaskDetail()
  if (!task) return null

  const status = permissions.isCancelled
    ? 'CANCELLED'
    : permissions.taskStatus === 'AWARDED'
      ? 'AWARDED'
      : permissions.taskStatus === 'CLOSED'
        ? 'CLOSED'
        : 'OPEN'

  const locationLabel = taskDetailLocationLabel({
    task,
    myOrder,
    showExactLocation: taskDetailShowsExactLocation({
      myOrder,
      showFullAddress: permissions.showFullAddress,
    }),
  })
  const whenLabel = taskAvailabilityRangeLabel(task)
  const category = taskCategoryLabel(task)
  const budgetLine = task.budget
    ? taskBudgetDisplayLine(
        task,
        permissions.isOwner ? 'owner' : 'visitor',
        me?.id,
      )
    : null

  return (
    <Wrap gap={2} px={4} py={2} bg="bg.canvas">
      <WrapItem>
        <TaskStatusPill status={status} size="sm" />
      </WrapItem>
      {locationLabel ? (
        <WrapItem>
          <Badge variant="neutral" shape="pill">
            {locationLabel}
          </Badge>
        </WrapItem>
      ) : null}
      <WrapItem>
        <Badge variant="neutral" shape="pill">
          {whenLabel}
        </Badge>
      </WrapItem>
      {budgetLine ? (
        <WrapItem>
          <Badge variant="neutral" shape="pill">
            {budgetLine}
          </Badge>
        </WrapItem>
      ) : null}
      {category ? (
        <WrapItem>
          <Badge variant="neutral" shape="pill">
            {category}
          </Badge>
        </WrapItem>
      ) : null}
    </Wrap>
  )
}
