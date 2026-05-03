'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { formatRelativeTime } from '@/utils/formatRelativeTime'
import { taskPublicLocationLabel } from '@/utils/taskLocationDisplay'
import { Badge } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TaskDetailLocationMap } from '../TaskDetailLocationMap'
import {
  budgetKindLabel,
  taskAvailabilityRangeLabel,
  taskBudgetDisplayLine,
  taskMapCoordinates,
} from '../taskDetailUtils'
import { MetaRow } from './MetaRow'
import {
  IconCalendar,
  IconClock,
  IconPin,
  IconWallet,
} from './VisitorMetaIcons'

export function TaskVisitorMeta() {
  const { task, me, isOwner } = useTaskDetail()
  if (!task) return null

  const place = taskPublicLocationLabel(task)
  const coords = taskMapCoordinates(task)
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const budgetLine = taskBudgetDisplayLine(
    task,
    isOwner ? 'owner' : 'visitor',
    me?.id,
  )
  const budgetBadge = budgetKindLabel(task.budget?.type)
  const timing = taskAvailabilityRangeLabel(task)

  return (
    <Stack gap={5} w="full">
      {coords && mapboxToken?.trim() ? (
        <Stack gap={2}>
          <Box
            borderRadius="lg"
            overflow="hidden"
            borderWidth="1px"
            borderColor="cardBorder"
          >
            <TaskDetailLocationMap
              accessToken={mapboxToken}
              lat={coords.lat}
              lng={coords.lng}
              height="160px"
            />
          </Box>
        </Stack>
      ) : null}

      <Stack gap={0}>
        <Box pb={4} borderBottomWidth="1px" borderColor="cardDivider">
          <MetaRow label="Posted" icon={<IconClock />}>
            {formatRelativeTime(task.createdAt)}
          </MetaRow>
        </Box>
        <Box py={4} borderBottomWidth="1px" borderColor="cardDivider">
          <MetaRow label="Location" icon={<IconPin />}>
            {place || 'Location shared after you accept a quote'}
          </MetaRow>
        </Box>
        <Box py={4} borderBottomWidth="1px" borderColor="cardDivider">
          <MetaRow label="Budget" icon={<IconWallet />}>
            <HStack gap={2} flexWrap="wrap" align="center">
              <Text as="span" fontSize="sm" fontWeight={600}>
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
        </Box>
        <Box pt={4}>
          <MetaRow label="Timing" icon={<IconCalendar />}>
            {timing}
          </MetaRow>
        </Box>
      </Stack>
    </Stack>
  )
}
