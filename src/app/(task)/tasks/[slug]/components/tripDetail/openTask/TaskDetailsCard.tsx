'use client'

import { useI11n } from '@/i18n/useI11n'
import { HStack, Stack } from '@chakra-ui/react'
import {
  LuCalendar,
  LuEye,
  LuMapPin,
  LuPoundSterling,
  LuTag,
  LuWrench,
} from 'react-icons/lu'
import bag from '../../../i11n.json'

import { formatMessage } from '@/i18n/loadPageI11n'
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
  const t = useI11n(bag)
  if (!task) return null

  const title = task.title?.trim() || t.fallbackTask
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
  const viewsCount = task.views
  const viewsLabel =
    viewsCount == null
      ? t.details.viewsColdStart
      : formatMessage(
          viewsCount === 1 ? t.details.viewsOne : t.details.viewsMany,
          { count: viewsCount },
        )

  return (
    <Card layout="section" heading={t.details.heading}>
      <Stack gap={0}>
        <DetailRow
          icon={<LuWrench />}
          label={t.details.task}
          subLine={task.description ?? undefined}
          withDivider
        >
          {title}
        </DetailRow>
        {viewsLabel ? (
          <DetailRow icon={<LuEye />} label={t.details.views} withDivider>
            {viewsLabel}
          </DetailRow>
        ) : null}
        {locationLabel ? (
          <DetailRow icon={<LuMapPin />} label={t.details.location} withDivider>
            {locationLabel}
          </DetailRow>
        ) : null}
        {category ? (
          <DetailRow icon={<LuTag />} label={t.details.category} withDivider>
            {category}
          </DetailRow>
        ) : null}
        <DetailRow
          icon={<LuCalendar />}
          label={t.details.when}
          subLine={t.details.preferredTiming}
          withDivider
        >
          {timing}
        </DetailRow>
        <DetailRow icon={<LuPoundSterling />} label={t.details.budget}>
          <HStack as="span" gap={2} align="center">
            <span>{budgetLine}</span>
            {budgetKind ? <Badge variant="success">{budgetKind}</Badge> : null}
          </HStack>
        </DetailRow>
      </Stack>
    </Card>
  )
}
