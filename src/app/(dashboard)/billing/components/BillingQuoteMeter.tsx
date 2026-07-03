'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

type BillingQuoteMeterProps = {
  used: number
  total: number
}

export function BillingQuoteMeter({ used, total }: BillingQuoteMeterProps) {
  const safeTotal = Math.max(total, 1)
  const pct = Math.min(100, Math.round((used / safeTotal) * 100))

  return (
    <Stack gap={2}>
      <HStack justify="space-between" align="baseline">
        <Text fontSize="sm" fontWeight={600} color="text.default">
          Quotes this month (UTC)
        </Text>
        <Text fontSize="sm" color="text.muted">
          {used} / {total}
        </Text>
      </HStack>
      <Box
        h="2"
        borderRadius="full"
        bg="bg.subtle"
        overflow="hidden"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${used} of ${total} free quotes used this month`}
      >
        <Box h="full" w={`${pct}%`} bg="action.primary" borderRadius="full" />
      </Box>
      <Text fontSize="xs" color="text.muted">
        Resets at the start of each UTC calendar month.
      </Text>
    </Stack>
  )
}
