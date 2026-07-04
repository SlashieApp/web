'use client'

import { HStack, Stack } from '@chakra-ui/react'
import {
  LuCalendar,
  LuClipboardList,
  LuEye,
  LuMapPin,
  LuPoundSterling,
  LuTag,
  LuWrench,
} from 'react-icons/lu'

import { taskDetailViewsLabel } from '@/app/(task)/helpers/taskViewLabels'
import { Badge, Card, DetailRow } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import {
  budgetKindLabel,
  taskAvailabilityRangeLabel,
  taskBudgetDisplayLine,
  taskCategoryLabel,
  taskDetailLocationLabel,
  taskDetailShowsExactLocation,
} from '../../../helpers/taskDetailUtils'

/** "Task details" card — shared by owner / non-owner / mobile. */
export function TaskDetailsCard() {
  const { task, myOrder, me, permissions } = useTaskDetail()
  if (!task) return null

  const title = task.title?.trim() || 'Task'
  const category = taskCategoryLabel(task)
  const locationLabel = taskDetailLocationLabel({
    task,
    myOrder,
    showExactLocation: taskDetailShowsExactLocation({
      myOrder,
      showFullAddress: permissions.showFullAddress,
    }),
  })
  const timing = taskAvailabilityRangeLabel(task)
  const budgetLine = taskBudgetDisplayLine(
    task,
    permissions.isOwner ? 'owner' : 'visitor',
    me?.id,
  )
  const budgetKind = budgetKindLabel(task.budget?.type)
  const viewsLabel = taskDetailViewsLabel(task, permissions.isOwner)

  return (
    <Card layout="section" icon={<LuClipboardList />} heading="Task details">
      <Stack gap={0}>
        <DetailRow
          icon={<LuWrench />}
          label="Task"
          subLine={task.description ?? undefined}
          withDivider
        >
          {title}
        </DetailRow>
        {viewsLabel ? (
          <DetailRow icon={<LuEye />} label="Views" withDivider>
            {viewsLabel}
          </DetailRow>
        ) : null}
        {locationLabel ? (
          <DetailRow icon={<LuMapPin />} label="Location" withDivider>
            {locationLabel}
          </DetailRow>
        ) : null}
        {category ? (
          <DetailRow icon={<LuTag />} label="Category" withDivider>
            {category}
          </DetailRow>
        ) : null}
        <DetailRow
          icon={<LuCalendar />}
          label="When"
          subLine="Preferred timing"
          withDivider
        >
          {timing}
        </DetailRow>
        <DetailRow icon={<LuPoundSterling />} label="Budget">
          <HStack as="span" gap={2} align="center">
            <span>{budgetLine}</span>
            {budgetKind ? <Badge variant="success">{budgetKind}</Badge> : null}
          </HStack>
        </DetailRow>
      </Stack>
    </Card>
  )
}
