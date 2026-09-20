'use client'

import { useI11n } from '@/i18n/useI11n'
import { Skeleton, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { LuCalendar, LuEye, LuMapPin, LuTag, LuWrench } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { Card, DetailRow } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'
import {
  taskAvailabilityRangeLabel,
  taskCategoryLabel,
  taskDetailLocationLabel,
  taskDetailShowsExactLocation,
} from '../../../helpers/taskDetailUtils'
import bag from '../../../i11n.json'

const LINE_BOX = 'calc(0.875rem * 1.5)'

function TextLineSkeleton({ width }: { width: string }) {
  return <Skeleton h={LINE_BOX} w={width} borderRadius="md" />
}

function FactRow({
  icon,
  label,
  value,
  pending,
  skeletonWidth,
  withDivider = true,
  subLine,
}: {
  icon: ReactNode
  label: string
  value?: string | null
  pending?: boolean
  skeletonWidth: string
  withDivider?: boolean
  subLine?: string
}) {
  if (!value && !pending) return null
  return (
    <DetailRow
      icon={icon}
      label={label}
      withDivider={withDivider}
      subLine={subLine}
    >
      {value ? value : <TextLineSkeleton width={skeletonWidth} />}
    </DetailRow>
  )
}

/** Task facts card — title lives in the page header, not repeated here. */
export function TaskDetailsCard() {
  const { task, seed, pending, myOrder, permissions } = useTaskDetail()
  const t = useI11n(bag)

  if (!task && !pending) return null

  const description = task
    ? task.description?.trim()
    : seed?.description?.trim()
  const category = task ? taskCategoryLabel(task) : seed?.badgeText
  const locationLabel = task
    ? taskDetailLocationLabel({
        task,
        myOrder,
        showExactLocation: taskDetailShowsExactLocation({
          myOrder,
          showFullAddress: permissions.showFullAddress,
        }),
      })
    : seed?.location
  const timing = task ? taskAvailabilityRangeLabel(task) : seed?.timingLabel
  const viewsCount = task?.views
  const viewsLabel = task
    ? viewsCount == null
      ? t.details.viewsColdStart
      : formatMessage(
          viewsCount === 1 ? t.details.viewsOne : t.details.viewsMany,
          { count: viewsCount },
        )
    : seed?.viewsLabel
  const loading = pending && !task

  return (
    <Card layout="section" aria-busy={loading ? true : undefined}>
      <Stack gap={0}>
        <FactRow
          icon={<LuWrench />}
          label={t.details.task}
          value={description}
          pending={loading}
          skeletonWidth="70%"
        />
        <FactRow
          icon={<LuEye />}
          label={t.details.views}
          value={viewsLabel}
          pending={loading}
          skeletonWidth="40%"
        />
        <FactRow
          icon={<LuMapPin />}
          label={t.details.location}
          value={locationLabel}
          pending={loading}
          skeletonWidth="55%"
        />
        <FactRow
          icon={<LuTag />}
          label={t.details.category}
          value={category}
          pending={loading}
          skeletonWidth="35%"
        />
        <FactRow
          icon={<LuCalendar />}
          label={t.details.when}
          value={timing}
          pending
          skeletonWidth="45%"
          withDivider={false}
          subLine={t.details.preferredTiming}
        />
      </Stack>
    </Card>
  )
}
