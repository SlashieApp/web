'use client'

import { HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useMemo } from 'react'

import { Badge, SectionCard } from '@ui'

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
    <SectionCard p={5}>
      <Stack gap={4}>
        <HStack justify="space-between" align="center">
          <Text fontWeight={700} fontSize="md" color="cardFg">
            Upcoming
          </Text>
        </HStack>

        {groups.length === 0 ? (
          <Text fontSize="sm" color="formLabelMuted">
            No scheduled tasks yet. Booked work with exact dates will show here.
          </Text>
        ) : (
          <Stack gap={4}>
            {groups.map((group) => (
              <Stack key={group.label} gap={2}>
                <Text fontSize="xs" fontWeight={700} color="formLabelMuted">
                  {group.label}
                </Text>
                <Stack gap={2}>
                  {group.events.map((event) => (
                    <Link
                      key={event.rowId}
                      as={NextLink}
                      href={event.href}
                      display="block"
                      p={3}
                      borderRadius="lg"
                      bg="badgeBg"
                      _hover={{ textDecoration: 'none', bg: 'primary.100' }}
                    >
                      <HStack
                        justify="space-between"
                        align="flex-start"
                        gap={3}
                      >
                        <Stack gap={0.5} minW={0}>
                          <Text fontSize="sm" fontWeight={600} lineClamp={1}>
                            {event.title}
                          </Text>
                          <Text
                            fontSize="xs"
                            color="formLabelMuted"
                            lineClamp={1}
                          >
                            {event.location}
                          </Text>
                          <Text fontSize="xs" color="formLabelMuted">
                            {event.timeLabel}
                          </Text>
                        </Stack>
                        <EventStatusBadge status={event.status} />
                      </HStack>
                    </Link>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </SectionCard>
  )
}

function EventStatusBadge({
  status,
}: {
  status: 'booked' | 'upcoming'
}) {
  const tone =
    status === 'booked'
      ? { bg: 'primary.100', color: 'primary.800', label: 'Booked' }
      : { bg: 'secondary.100', color: 'secondary.800', label: 'Upcoming' }

  return (
    <Badge bg={tone.bg} color={tone.color} flexShrink={0}>
      {tone.label}
    </Badge>
  )
}
