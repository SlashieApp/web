'use client'

import { Box, HStack, Text } from '@chakra-ui/react'

import { formatPounds } from '@/utils/dashboardHelpers'

import { useWorkerQuotes } from '../context/WorkerQuotesProvider'

export function WorkerQuoteSummaryBar() {
  const { summaryCounts: counts } = useWorkerQuotes()
  const parts: string[] = []
  if (counts.pending > 0) {
    parts.push(`${counts.pending} pending`)
  }
  if (counts.booked > 0) {
    parts.push(`${counts.booked} booked`)
  }
  if (counts.actionToday > 0) {
    parts.push(`${counts.actionToday} action today`)
  }

  const summary =
    parts.length > 0 ? parts.join(' · ') : 'No active quotes right now'

  return (
    <HStack
      justify="space-between"
      align="center"
      gap={3}
      flexWrap="wrap"
      px={4}
      py={3}
      borderRadius="lg"
      bg="badgeBg"
    >
      <HStack gap={2} fontSize="sm" color="formLabelMuted" flexWrap="wrap">
        <Box as="span" display="inline-flex" color="primary.700" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <title>Summary</title>
            <path
              d="M4 6h16M4 12h10M4 18h6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </Box>
        <Text>{summary}</Text>
      </HStack>

      {counts.bookedValuePence > 0 ? (
        <HStack gap={1.5} fontSize="sm" color="cardFg" flexShrink={0}>
          <Text fontWeight={600}>
            {formatPounds(counts.bookedValuePence)} in booked work
          </Text>
          <Text color="formLabelMuted" fontSize="xs">
            (Reference only)
          </Text>
          <Box
            as="span"
            display="inline-flex"
            color="formLabelMuted"
            aria-label="Booked work total is indicative only"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <title>Info</title>
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M12 11v5M12 8h.01"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </Box>
        </HStack>
      ) : null}
    </HStack>
  )
}
