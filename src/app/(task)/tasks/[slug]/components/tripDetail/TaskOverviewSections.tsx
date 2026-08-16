'use client'

import { useI11n } from '@/i18n/useI11n'
import { Stack, Text } from '@chakra-ui/react'
import { LuCalendar, LuMapPin } from 'react-icons/lu'
import bag from '../../i11n.json'

import { Card, DetailRow } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  taskAvailabilityRangeLabel,
  taskDetailLocationLabel,
  taskDetailShowsExactLocation,
} from '../../helpers/taskDetailUtils'
import { TaskOwnerCard } from '../TaskOwnerCard'

/**
 * Overview stack: description, location / when, and the poster card for
 * non-owners. No large "Overview" heading — the sticky title already names
 * the task.
 */
export function TaskOverviewSections() {
  const { task, myOrder, permissions } = useTaskDetail()
  const t = useI11n(bag)
  if (!task) return null

  const description = task.description?.trim()
  const locationLabel = taskDetailLocationLabel({
    task,
    myOrder,
    showExactLocation: taskDetailShowsExactLocation({
      myOrder,
      showFullAddress: permissions.showFullAddress,
    }),
  })
  const timing = taskAvailabilityRangeLabel(task)

  return (
    <Stack gap={5} w="full" minW={0} pointerEvents="auto">
      {description ? (
        <Text fontSize="md" color="text.default" whiteSpace="pre-wrap">
          {description}
        </Text>
      ) : null}

      <Card layout="section">
        <Stack gap={0}>
          {locationLabel ? (
            <DetailRow
              icon={<LuMapPin />}
              label={t.details.location}
              withDivider
            >
              {locationLabel}
            </DetailRow>
          ) : null}
          <DetailRow
            icon={<LuCalendar />}
            label={t.details.when}
            subLine={t.details.preferredTiming}
          >
            {timing}
          </DetailRow>
        </Stack>
      </Card>

      {permissions.isOwner ? null : <TaskOwnerCard />}
    </Stack>
  )
}
