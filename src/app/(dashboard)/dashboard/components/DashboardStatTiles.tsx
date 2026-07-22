'use client'

import { Box, HStack, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { Card } from '@ui'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { formatPounds } from '@/utils/dashboardHelpers'

import bag from '../i11n.json'

export type DashboardStatTilesProps = {
  loading: boolean
  postedCount: number
  openPostedCount: number
  awaitingQuotesCount: number
  quotesSentCount: number
  quotesAwaitingResponseCount: number
  openOrdersCount: number
  pendingEarningsPence: number
  closedOrdersCount: number
}

function StatTile({
  label,
  value,
  helper,
  icon,
}: {
  label: string
  value: string
  helper: string
  icon: ReactNode
}) {
  return (
    <Card layout="section" p={5}>
      <Stack gap={2}>
        <HStack justify="space-between" align="flex-start">
          <Text fontSize="xs" fontWeight={700} color="text.muted">
            {label}
          </Text>
          <Box
            w={9}
            h={9}
            borderRadius="full"
            bg="status.success.soft"
            color="status.success.fg"
            display="grid"
            placeItems="center"
            aria-hidden
          >
            {icon}
          </Box>
        </HStack>
        <Heading size={{ base: 'md', md: 'lg' }} color="text.default">
          {value}
        </Heading>
        <Text fontSize="xs" color="text.muted">
          {helper}
        </Text>
      </Stack>
    </Card>
  )
}

function TileIcon({
  type,
}: {
  type: 'posted' | 'quotes' | 'accepted' | 'done'
}) {
  if (type === 'posted') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <title>Posted tasks</title>
        <path
          d="M7 4h10l3 3v13H4V4h3Zm10 0v3h3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (type === 'quotes') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <title>Quotes sent</title>
        <path
          d="m5 12 5 5L20 7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (type === 'accepted') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <title>Accepted jobs</title>
        <path
          d="M4 8h16v11H4V8Zm4-3h8v3H8V5Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Completed jobs</title>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="m8 12 2.7 2.7L16 9.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DashboardStatTiles({
  loading,
  postedCount,
  openPostedCount,
  awaitingQuotesCount,
  quotesSentCount,
  quotesAwaitingResponseCount,
  openOrdersCount,
  pendingEarningsPence,
  closedOrdersCount,
}: DashboardStatTilesProps) {
  const t = useI11n(bag)
  const value = (n: number) => (loading ? '…' : String(n))

  return (
    <SimpleGrid
      columns={{ base: 2, xl: 4 }}
      gap={3}
      aria-busy={loading || undefined}
    >
      <StatTile
        label={t.stats.posted}
        value={value(postedCount)}
        helper={formatMessage(t.stats.postedHelper, {
          open: openPostedCount,
          awaiting: awaitingQuotesCount,
        })}
        icon={<TileIcon type="posted" />}
      />
      <StatTile
        label={t.stats.quotes}
        value={value(quotesSentCount)}
        helper={formatMessage(t.stats.quotesHelper, {
          awaiting: quotesAwaitingResponseCount,
        })}
        icon={<TileIcon type="quotes" />}
      />
      <StatTile
        label={t.stats.orders}
        value={value(openOrdersCount)}
        helper={t.stats.ordersHelper}
        icon={<TileIcon type="accepted" />}
      />
      <StatTile
        label={t.stats.earnings}
        value={loading ? '…' : formatPounds(pendingEarningsPence)}
        helper={formatMessage(t.stats.earningsHelper, {
          closed: closedOrdersCount,
        })}
        icon={<TileIcon type="done" />}
      />
    </SimpleGrid>
  )
}
