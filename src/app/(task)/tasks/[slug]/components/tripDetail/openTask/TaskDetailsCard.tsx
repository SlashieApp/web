'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Skeleton, Stack } from '@chakra-ui/react'
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
import { ViewTransition } from '@/ui/ViewTransition'
import { Badge, Card, DetailRow } from '@ui'

import { taskVtName } from '@/app/(task)/helpers/taskCardHandoff'
import { useTaskDetail } from '../../../context/TaskDetailProvider'
import {
  budgetKindLabel,
  taskAvailabilityRangeLabel,
  taskBudgetDisplayLine,
  taskCategoryLabel,
  taskDetailLocationLabel,
  taskDetailShowsExactLocation,
} from '../../../helpers/taskDetailUtils'

const LINE_BOX = 'calc(0.875rem * 1.5)'

function TextLineSkeleton({ width }: { width: string }) {
  return <Skeleton h={LINE_BOX} w={width} borderRadius="md" />
}

/** "Task details" card — shared by owner / non-owner / mobile. */
export function TaskDetailsCard() {
  const { task, seed, pending, taskId, myOrder, me, permissions } =
    useTaskDetail()
  const t = useI11n(bag)

  if (!task && !pending) return null

  const named = Boolean(task || seed)
  const title = task ? task.title?.trim() || t.fallbackTask : seed?.title
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
  const budgetLine = task
    ? taskBudgetDisplayLine(
        task,
        permissions.isOwner ? 'owner' : 'visitor',
        me?.id,
      )
    : seed?.priceLabel
  const budgetKind = task ? budgetKindLabel(task.budget?.type) : null
  const viewsCount = task?.views
  const viewsLabel = task
    ? viewsCount == null
      ? t.details.viewsColdStart
      : formatMessage(
          viewsCount === 1 ? t.details.viewsOne : t.details.viewsMany,
          { count: viewsCount },
        )
    : seed?.viewsLabel

  return (
    <Card
      layout="section"
      heading={t.details.heading}
      aria-busy={pending && !task ? true : undefined}
    >
      <Stack gap={0}>
        <DetailRow
          icon={<LuWrench />}
          label={t.details.task}
          subLine={description || undefined}
          withDivider
        >
          <ViewTransition
            name={named ? taskVtName('title', taskId) : undefined}
            share="vt-text"
            default="none"
          >
            {title ? (
              <Box as="span">{title}</Box>
            ) : (
              <TextLineSkeleton width="70%" />
            )}
          </ViewTransition>
        </DetailRow>
        {viewsLabel ? (
          <DetailRow icon={<LuEye />} label={t.details.views} withDivider>
            {viewsLabel}
          </DetailRow>
        ) : pending && !task ? (
          <DetailRow icon={<LuEye />} label={t.details.views} withDivider>
            <TextLineSkeleton width="40%" />
          </DetailRow>
        ) : null}
        {locationLabel ? (
          <DetailRow icon={<LuMapPin />} label={t.details.location} withDivider>
            {locationLabel}
          </DetailRow>
        ) : pending && !task ? (
          <DetailRow icon={<LuMapPin />} label={t.details.location} withDivider>
            <TextLineSkeleton width="55%" />
          </DetailRow>
        ) : null}
        {category ? (
          <DetailRow icon={<LuTag />} label={t.details.category} withDivider>
            {category}
          </DetailRow>
        ) : pending && !task ? (
          <DetailRow icon={<LuTag />} label={t.details.category} withDivider>
            <TextLineSkeleton width="35%" />
          </DetailRow>
        ) : null}
        <DetailRow
          icon={<LuCalendar />}
          label={t.details.when}
          subLine={t.details.preferredTiming}
          withDivider
        >
          {timing ? timing : <TextLineSkeleton width="45%" />}
        </DetailRow>
        <DetailRow icon={<LuPoundSterling />} label={t.details.budget}>
          <HStack as="span" gap={2} align="center">
            <ViewTransition
              name={named ? taskVtName('price', taskId) : undefined}
              share="vt-text"
              default="none"
            >
              {budgetLine ? (
                <Box as="span">{budgetLine}</Box>
              ) : (
                <TextLineSkeleton width="24%" />
              )}
            </ViewTransition>
            {budgetKind ? (
              <Badge variant="success">{budgetKind}</Badge>
            ) : pending && !task ? (
              <Skeleton h="20px" w="72px" borderRadius="full" />
            ) : null}
          </HStack>
        </DetailRow>
      </Stack>
    </Card>
  )
}
