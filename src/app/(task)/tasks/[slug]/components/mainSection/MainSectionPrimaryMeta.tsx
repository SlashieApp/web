'use client'

import {
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
} from 'react'

import { Box, Grid, HStack, Stack, Text } from '@chakra-ui/react'

import { taskDetailViewsLabel } from '@/app/(task)/helpers/taskViewLabels'
import { Badge } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  budgetKindLabel,
  buildAvailabilityChips,
  formatTaskBudgetPaymentMethodLabel,
  taskBudgetDisplayLine,
  taskCategoryLabel,
  taskDetailLocationLabel,
  taskDetailMapCoordinates,
  taskDetailShowsExactLocation,
  taskDurationEstimateLabel,
  taskPrimaryCalendarLabel,
} from '../../helpers/taskDetailUtils'
import { LocationMap } from '../metaSection/LocationMap'
import { MetaRow, metaSectionLabelProps } from '../metaSection/MetaRow'
import {
  IconBudgetGrid,
  IconCalendar,
  IconClock,
  IconPaymentMethod,
  IconPin,
  IconTag,
  IconViews,
} from '../metaSection/VisitorMetaIcons'

/** Vertical meta list for viewports below `xl` (sidebar meta is used from `xl` up). */
export function MainSectionPrimaryMeta() {
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

  const category = taskCategoryLabel(task)
  const calendar = taskPrimaryCalendarLabel(task)
  const duration = taskDurationEstimateLabel(task)
  const budgetLine = taskBudgetDisplayLine(
    task,
    isOwner ? 'owner' : 'visitor',
    me?.id,
  )
  const budgetBadge = budgetKindLabel(task.budget?.type)
  const paymentMethod = task.budget?.paymentMethod?.trim()
  const availabilityChips = buildAvailabilityChips(task)
  const viewsLabel = taskDetailViewsLabel(task, isOwner)

  type Block = { key: string; node: ReactNode }
  const blocks: Block[] = []

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

  if (coords && mapboxToken?.trim()) {
    blocks.push({
      key: 'location',
      node: (
        <Grid
          templateColumns={{
            base: '1fr',
            sm: 'minmax(0, 1fr) minmax(0, 1fr)',
          }}
          gap={4}
          w="full"
          alignItems="stretch"
        >
          <Box minW={0}>
            <MetaRow label="Location" icon={<IconPin />}>
              {place || 'Approximate area'}
            </MetaRow>
          </Box>
          <Box minW={0} w="full">
            <LocationMap
              accessToken={mapboxToken}
              lat={coords.lat}
              lng={coords.lng}
              height="200px"
              variant={showExactLocation ? 'exact' : 'approximate'}
            />
          </Box>
        </Grid>
      ),
    })
  } else {
    blocks.push({
      key: 'location',
      node: (
        <MetaRow label="Location" icon={<IconPin />}>
          {place || 'Approximate area'}
        </MetaRow>
      ),
    })
  }

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
    key: 'when',
    node: (
      <MetaRow label="When" icon={<IconCalendar />}>
        {calendar}
      </MetaRow>
    ),
  })

  if (availabilityChips.length > 0) {
    blocks.push({
      key: 'availability',
      node: (
        <MetaRow label="Preferred availability" icon={<IconClock />}>
          <Stack gap={4} w="full">
            {availabilityChips.map((c, index) => (
              <Stack
                key={c.key}
                gap={1}
                align="flex-start"
                pt={index > 0 ? 3 : 0}
                borderTopWidth={index > 0 ? '1px' : undefined}
                borderColor="cardDivider"
              >
                <Text {...metaSectionLabelProps}>{c.monthDay}</Text>
                <Text
                  fontSize="sm"
                  fontWeight={700}
                  color="cardFg"
                  lineHeight="short"
                >
                  {c.title}
                </Text>
                <Text
                  fontSize="xs"
                  fontWeight={500}
                  color="formLabelMuted"
                  lineHeight="short"
                >
                  {c.subtitle}
                </Text>
              </Stack>
            ))}
          </Stack>
        </MetaRow>
      ),
    })
  }

  if (duration) {
    blocks.push({
      key: 'estimated',
      node: (
        <MetaRow label="Estimated time" icon={<IconClock />}>
          {duration.replace(/-/g, '–')}
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
              bg="primary.100"
              color="primary.700"
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

  return (
    <Stack
      gap={0}
      w="full"
      display={{ base: 'flex', xl: 'none' }}
      aria-label="Task summary"
    >
      {blocks.map((b, i) =>
        isValidElement(b.node)
          ? cloneElement(b.node as ReactElement<{ withDivider?: boolean }>, {
              key: b.key,
              withDivider: i < blocks.length - 1,
            })
          : null,
      )}
    </Stack>
  )
}
