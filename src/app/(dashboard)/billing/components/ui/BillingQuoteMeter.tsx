'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { ProgressBar } from '@ui'

import bag from '../../i11n.json'

type BillingQuoteMeterProps = {
  used: number
  total: number
  /** When the allowance resets (formatted), if known. */
  resetsOn?: string | null
}

/** Free quotes used this month, against the allowance. */
export function BillingQuoteMeter({
  used,
  total,
  resetsOn,
}: BillingQuoteMeterProps) {
  const t = useI11n(bag).meter
  const safeTotal = Math.max(total, 1)
  const pct = Math.min(100, Math.round((used / safeTotal) * 100))

  return (
    <Stack gap={2}>
      <HStack justify="space-between" align="baseline" gap={3}>
        <Text fontSize="sm" fontWeight={600} color="text.default">
          {t.label}
        </Text>
        <Text fontSize="sm" color="text.muted">
          {formatMessage(t.used, { used, total })}
        </Text>
      </HStack>
      <ProgressBar
        value={pct}
        size="sm"
        trackLabel={formatMessage(t.aria, { used, total })}
      />
      {resetsOn ? (
        <Text fontSize="xs" color="text.muted">
          {formatMessage(t.resets, { date: resetsOn })}
        </Text>
      ) : null}
    </Stack>
  )
}
