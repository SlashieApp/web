'use client'

import { HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useMemo } from 'react'

import { Badge, SectionCard } from '@ui'

import { useWorkerQuotes } from '../context/WorkerQuotesProvider'
import {
  buildWorkerQuoteUpcomingEvents,
  groupWorkerQuoteUpcomingEvents,
} from '../helpers/workerQuoteSchedule'

export function WorkerQuoteUpcoming() {
  const { quoteRows } = useWorkerQuotes()

  const groups = useMemo(() => {
    const events = buildWorkerQuoteUpcomingEvents(quoteRows)
    return groupWorkerQuoteUpcomingEvents(events)
  }, [quoteRows])

  return (
    <SectionCard p={5}>
      <Stack gap={4}>
        <HStack justify="space-between" align="center">
          <Text fontWeight={700} fontSize="md" color="cardFg">
            Upcoming
          </Text>
          <Text fontSize="sm" fontWeight={600} color="primary.700">
            View all
          </Text>
        </HStack>

        {groups.length === 0 ? (
          <Text fontSize="sm" color="formLabelMuted">
            No scheduled jobs yet. Booked work with exact dates will show here.
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
                      _hover={{ textDecoration: 'none', bg: 'primary.50' }}
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

        <HStack gap={2} fontSize="xs" color="formLabelMuted" align="flex-start">
          <BoxShieldIcon />
          <Text>
            Payment arranged directly with customer outside Slashie.{' '}
            <Text as="span" color="primary.700" fontWeight={600}>
              Learn more
            </Text>
          </Text>
        </HStack>
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

function BoxShieldIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ flexShrink: 0, marginTop: 2 }}
    >
      <title>Trust</title>
      <path
        d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  )
}
