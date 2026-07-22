'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'

import bag from '../i11n.json'

type BillingQuoteMeterProps = {
  used: number
  total: number
}

export function BillingQuoteMeter({ used, total }: BillingQuoteMeterProps) {
  const t = useI11n(bag)
  const safeTotal = Math.max(total, 1)
  const pct = Math.min(100, Math.round((used / safeTotal) * 100))

  return (
    <Stack gap={2}>
      <HStack justify="space-between" align="baseline">
        <Text fontSize="sm" fontWeight={600} color="text.default">
          {t.meter.label}
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
        aria-label={formatMessage(t.meter.aria, { used, total })}
      >
        <Box h="full" w={`${pct}%`} bg="action.primary" borderRadius="full" />
      </Box>
      <Text fontSize="xs" color="text.muted">
        {t.meter.reset}
      </Text>
    </Stack>
  )
}
