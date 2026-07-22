'use client'

import { Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'

import { InboxUpcomingEventRow } from '@/app/(dashboard)/components/inbox/InboxUpcomingEventRow'

import { Card } from '@ui'

import { useWorkerQuotes } from '../../context/WorkerQuotesProvider'
import {
  buildWorkerQuoteUpcomingEvents,
  groupWorkerQuoteUpcomingEvents,
} from '../../helpers/workerQuoteSchedule'

export function WorkerQuoteUpcoming() {
  const { quoteRows } = useWorkerQuotes()

  const groups = useMemo(() => {
    const events = buildWorkerQuoteUpcomingEvents(quoteRows)
    return groupWorkerQuoteUpcomingEvents(events)
  }, [quoteRows])

  return (
    <Card layout="section" p={5}>
      <Stack gap={4}>
        <Text fontWeight={700} fontSize="md" color="text.default">
          Upcoming
        </Text>

        {groups.length === 0 ? (
          <Text fontSize="sm" color="text.muted">
            No scheduled jobs yet. Booked work with exact dates will show here.
          </Text>
        ) : (
          <Stack gap={3}>
            {groups.map((group) => (
              <Stack key={group.label} gap={1}>
                <Text fontSize="xs" fontWeight={700} color="text.muted">
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
