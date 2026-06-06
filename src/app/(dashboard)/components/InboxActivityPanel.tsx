'use client'

import { Box, HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { timeFromUnknown } from '@/utils/dashboardHelpers'
import { SectionCard } from '@ui'

import type {
  ActivityTone,
  NotificationActivityRow,
} from '../helpers/notificationActivity'

export function InboxActivityPanel({
  rows,
  loading = false,
  emptyMessage = 'No activity yet.',
}: {
  rows: readonly NotificationActivityRow[]
  loading?: boolean
  emptyMessage?: string
}) {
  return (
    <SectionCard p={5}>
      <Stack gap={4}>
        <Stack gap={1}>
          <Text fontWeight={700} fontSize="md" color="cardFg">
            Activity
          </Text>
          <Text fontSize="sm" color="formLabelMuted">
            Latest updates on your tasks and bookings.
          </Text>
        </Stack>

        {loading && rows.length === 0 ? (
          <Text color="formLabelMuted" fontSize="sm">
            Loading activity…
          </Text>
        ) : rows.length === 0 ? (
          <Text color="formLabelMuted" fontSize="sm">
            {emptyMessage}
          </Text>
        ) : (
          <Stack gap={1}>
            {rows.map((item) => {
              const row = (
                <HStack
                  key={item.id}
                  justify="space-between"
                  align="flex-start"
                  py={2.5}
                  borderBottomWidth="1px"
                  borderColor="cardBorder"
                  w="full"
                >
                  <HStack align="flex-start" gap={3} minW={0}>
                    <ActivityIcon tone={item.tone} />
                    <Stack gap={0} minW={0}>
                      <Text fontSize="sm" fontWeight={600} lineClamp={1}>
                        {item.title}
                      </Text>
                      <Text fontSize="xs" color="formLabelMuted" lineClamp={1}>
                        {item.subtitle}
                      </Text>
                    </Stack>
                  </HStack>
                  <ClockLabel happenedAt={item.happenedAt} />
                </HStack>
              )

              return item.href ? (
                <Link
                  key={item.id}
                  as={NextLink}
                  href={item.href}
                  display="block"
                  _hover={{ textDecoration: 'none', bg: 'badgeBg' }}
                  borderRadius="md"
                >
                  {row}
                </Link>
              ) : (
                <Box key={item.id}>{row}</Box>
              )
            })}
          </Stack>
        )}
      </Stack>
    </SectionCard>
  )
}

function ActivityIcon({ tone }: { tone: ActivityTone }) {
  const bgByTone = {
    green: 'green.100',
    purple: 'purple.100',
    blue: 'blue.100',
    mint: 'primary.100',
    red: 'red.100',
  } as const
  const fgByTone = {
    green: 'green.700',
    purple: 'purple.700',
    blue: 'blue.700',
    mint: 'primary.700',
    red: 'red.700',
  } as const

  return (
    <Box
      w={8}
      h={8}
      borderRadius="full"
      bg={bgByTone[tone]}
      color={fgByTone[tone]}
      display="grid"
      placeItems="center"
      fontSize="sm"
      fontWeight={700}
      flexShrink={0}
    >
      ·
    </Box>
  )
}

function ClockLabel({ happenedAt }: { happenedAt: unknown }) {
  const timestamp = timeFromUnknown(happenedAt)
  if (!timestamp) {
    return (
      <Text fontSize="xs" color="formLabelMuted" flexShrink={0}>
        Recently
      </Text>
    )
  }

  const diffMs = Date.now() - timestamp
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diffMs < hour) {
    return (
      <Text fontSize="xs" color="formLabelMuted" flexShrink={0}>
        {Math.max(1, Math.floor(diffMs / minute))}m ago
      </Text>
    )
  }
  if (diffMs < day) {
    return (
      <Text fontSize="xs" color="formLabelMuted" flexShrink={0}>
        {Math.floor(diffMs / hour)}h ago
      </Text>
    )
  }
  if (diffMs < day * 7) {
    return (
      <Text fontSize="xs" color="formLabelMuted" flexShrink={0}>
        {Math.floor(diffMs / day)}d ago
      </Text>
    )
  }

  return (
    <Text fontSize="xs" color="formLabelMuted" flexShrink={0}>
      Earlier
    </Text>
  )
}
