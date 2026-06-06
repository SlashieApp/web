'use client'

import { Box, HStack, Text } from '@chakra-ui/react'

import { formatPounds } from '@/utils/dashboardHelpers'

import { useMyRequestsPage } from '../context/MyRequestsProvider'

export function PostedTaskSummaryBar() {
  const { summaryCounts: counts } = useMyRequestsPage()
  const parts: string[] = []
  if (counts.quoting > 0) {
    parts.push(`${counts.quoting} collecting quotes`)
  }
  if (counts.booked > 0) {
    parts.push(`${counts.booked} in progress`)
  }
  if (counts.actionToday > 0) {
    parts.push(`${counts.actionToday} scheduled today`)
  }

  const summary =
    parts.length > 0 ? parts.join(' · ') : 'No active requests right now'

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

      {counts.bookedBudgetPence > 0 ? (
        <HStack gap={1.5} fontSize="sm" color="cardFg" flexShrink={0}>
          <Text fontWeight={600}>
            {formatPounds(counts.bookedBudgetPence)} in booked work
          </Text>
          <Text color="formLabelMuted" fontSize="xs">
            (Reference only)
          </Text>
        </HStack>
      ) : null}
    </HStack>
  )
}
