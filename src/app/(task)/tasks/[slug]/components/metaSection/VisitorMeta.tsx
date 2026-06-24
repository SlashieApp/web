'use client'

import {
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
} from 'react'

import { HStack, Stack, Text } from '@chakra-ui/react'

import { taskDetailViewsLabel } from '@/app/(task)/helpers/taskViewLabels'
import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { Badge } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  budgetKindLabel,
  formatTaskBudgetPaymentMethodLabel,
  getSecondaryTaskFact,
  taskAvailabilityRangeLabel,
  taskBudgetDisplayLine,
  taskCategoryLabel,
  taskDetailLocationLabel,
  taskDetailMapCoordinates,
  taskDetailShowsExactLocation,
  taskDurationEstimateLabel,
  taskUrgencyDisplayLabel,
} from '../../helpers/taskDetailUtils'
import { LocationMap } from './LocationMap'
import { MetaRow } from './MetaRow'
import {
  IconAccess,
  IconBudgetGrid,
  IconClock,
  IconParking,
  IconPaymentMethod,
  IconPin,
  IconTag,
  IconUrgency,
  IconViews,
  IconWrench,
} from './VisitorMetaIcons'

export function VisitorMeta() {
  const { task, me, permissions, myOrder } = useTaskDetail()
  if (!task) return null

  const { isOwner, showFullAddress } = permissions
  const showExactLocation = taskDetailShowsExactLocation({
    myOrder,
    showFullAddress,
  })
  const place = taskDetailLocationLabel({
    task,
    myOrder,
    showExactLocation,
  })
  const coords = taskDetailMapCoordinates(task, myOrder)
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const budgetLine = taskBudgetDisplayLine(
    task,
    isOwner ? 'owner' : 'visitor',
    me?.id,
  )
  const budgetBadge = budgetKindLabel(task.budget?.type)
  const timing = taskAvailabilityRangeLabel(task)
  const category = taskCategoryLabel(task)
  const paymentMethod = task.budget?.paymentMethod?.trim()
  const estimatedTime = taskDurationEstimateLabel(task)
  const urgency = taskUrgencyDisplayLabel(task)
  const accessFact = getSecondaryTaskFact(task, 'access')
  const toolsFact = getSecondaryTaskFact(task, 'tools')
  const parkingFact = getSecondaryTaskFact(task, 'parking')
  const viewsLabel = taskDetailViewsLabel(task, isOwner)

  type Block = { key: string; node: ReactNode }
  const blocks: Block[] = []

  blocks.push({
    key: 'posted',
    node: (
      <MetaRow label="Posted" icon={<IconClock />}>
        {formatRelativeTime(task.createdAt)}
      </MetaRow>
    ),
  })

  if (viewsLabel) {
    blocks.push({
      key: 'views',
      node: (
        <MetaRow label="Views" icon={<IconViews />}>
          {viewsLabel}
        </MetaRow>
      ),
    })
  }

  blocks.push({
    key: 'location',
    node: (
      <MetaRow label="Location" icon={<IconPin />}>
        {place || 'Location shared after you accept a quote'}
      </MetaRow>
    ),
  })

  if (category) {
    blocks.push({
      key: 'category',
      node: (
        <MetaRow label="Category" icon={<IconTag />}>
          {category}
        </MetaRow>
      ),
    })
  }

  blocks.push({
    key: 'budget',
    node: (
      <MetaRow label="Budget" icon={<IconBudgetGrid />}>
        <HStack gap={2} flexWrap="wrap" align="center">
          <Text as="span" fontSize="sm" fontWeight={700}>
            {budgetLine}
          </Text>
          {budgetBadge ? (
            <Badge
              px={2}
              py={0.5}
              fontSize="10px"
              fontWeight={700}
              bg="status.success.soft"
              color="status.success.fg"
            >
              {budgetBadge}
            </Badge>
          ) : null}
        </HStack>
      </MetaRow>
    ),
  })

  if (paymentMethod) {
    blocks.push({
      key: 'payment',
      node: (
        <MetaRow label="Payment" icon={<IconPaymentMethod />}>
          {formatTaskBudgetPaymentMethodLabel(paymentMethod)}
        </MetaRow>
      ),
    })
  }

  blocks.push({
    key: 'timing',
    node: (
      <MetaRow label="Timing" icon={<IconClock />}>
        {timing}
      </MetaRow>
    ),
  })

  if (estimatedTime) {
    blocks.push({
      key: 'estimated',
      node: (
        <MetaRow label="Estimated time" icon={<IconClock />}>
          {estimatedTime.replace(/-/g, '–')}
        </MetaRow>
      ),
    })
  }

  if (accessFact) {
    blocks.push({
      key: 'access',
      node: (
        <MetaRow label="Access" icon={<IconAccess />}>
          {accessFact.value}
        </MetaRow>
      ),
    })
  }

  if (toolsFact) {
    blocks.push({
      key: 'tools',
      node: (
        <MetaRow label="Tools" icon={<IconWrench />}>
          {toolsFact.value}
        </MetaRow>
      ),
    })
  }

  if (parkingFact) {
    blocks.push({
      key: 'parking',
      node: (
        <MetaRow label="Parking" icon={<IconParking />}>
          {parkingFact.value}
        </MetaRow>
      ),
    })
  }

  blocks.push({
    key: 'urgency',
    node: (
      <MetaRow label="Urgency" icon={<IconUrgency />}>
        {urgency}
      </MetaRow>
    ),
  })

  return (
    <Stack gap={4} w="full">
      {coords && mapboxToken?.trim() ? (
        <LocationMap
          accessToken={mapboxToken}
          lat={coords.lat}
          lng={coords.lng}
          height="160px"
          variant={showExactLocation ? 'exact' : 'approximate'}
        />
      ) : null}

      <Stack gap={0} w="full">
        {blocks.map((b, i) =>
          isValidElement(b.node)
            ? cloneElement(b.node as ReactElement<{ withDivider?: boolean }>, {
                key: b.key,
                withDivider: i < blocks.length - 1,
              })
            : null,
        )}
      </Stack>
    </Stack>
  )
}
