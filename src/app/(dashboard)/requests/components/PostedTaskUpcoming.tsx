'use client'

import { Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'

import { InboxUpcomingEventRow } from '@/app/(dashboard)/components/InboxUpcomingEventRow'

import { Card } from '@ui'

import { useMyRequestsPage } from '../context/MyRequestsProvider'
import {
  buildPostedTaskUpcomingEvents,
  groupPostedTaskUpcomingEvents,
} from '../helpers/postedTaskSchedule'

export function PostedTaskUpcoming() {
  const { taskRows } = useMyRequestsPage()

  const groups = useMemo(() => {
    const events = buildPostedTaskUpcomingEvents(taskRows)
    return groupPostedTaskUpcomingEvents(events)
  }, [taskRows])

  return (
    <Card layout="section" p={5}>
      <Stack gap={4}>
        <Text fontWeight={700} fontSize="md" color="cardFg">
          Upcoming
        </Text>

        {groups.length === 0 ? (
          <Text fontSize="sm" color="formLabelMuted">
            No scheduled tasks yet. Booked work with exact dates will show here.
          </Text>
        ) : (
          <Stack gap={3}>
            {groups.map((group) => (
              <Stack key={group.label} gap={1}>
                <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
                  {group.label}
                </Text>
                <Stack gap={0}>
                  {group.events.map((event) => (
                    <InboxUpcomingEventRow
                      key={event.rowId}
                      href={event.href}
                      title={event.title}
                      timeLabel={event.timeLabel}
                      status={event.status}
                    />
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  )
}
