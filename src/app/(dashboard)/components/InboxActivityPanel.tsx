'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'

import { formatRelativeAgo } from '@/utils/dashboardHelpers'
import { Button, Card, EmptyState, Link } from '@ui'

import type {
  ActivityTone,
  NotificationActivityRow,
} from '../helpers/notificationActivity'

export function InboxActivityPanel({
  rows,
  loading = false,
  emptyMessage = 'No activity yet.',
  emptyActionHref,
  emptyActionLabel,
  title = 'Activity',
  description = 'Latest updates on your tasks and bookings.',
  viewAllHref,
  viewAllLabel = 'View all',
}: {
  rows: readonly NotificationActivityRow[]
  loading?: boolean
  emptyMessage?: string
  emptyActionHref?: string
  emptyActionLabel?: string
  title?: string
  description?: string
  viewAllHref?: string
  viewAllLabel?: string
}) {
  return (
    <Card layout="section" p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <HStack justify="space-between" gap={3} align="flex-start">
          <Stack gap={1}>
            <Text fontWeight={700} fontSize="md" color="text.default">
              {title}
            </Text>
            <Text fontSize="sm" color="text.muted">
              {description}
            </Text>
          </Stack>
          {viewAllHref ? (
            <Link
              href={viewAllHref}
              fontSize="sm"
              fontWeight={600}
              color="text.link"
              flexShrink={0}
              _hover={{ textDecoration: 'none', color: 'text.link' }}
            >
              {viewAllLabel}
            </Link>
          ) : null}
        </HStack>

        {loading && rows.length === 0 ? (
          <Text as="output" color="text.muted" fontSize="sm">
            Loading activity…
          </Text>
        ) : rows.length === 0 ? (
          emptyActionHref && emptyActionLabel ? (
            <EmptyState title={emptyMessage}>
              <Link href={emptyActionHref} _hover={{ textDecoration: 'none' }}>
                <Button size="sm">{emptyActionLabel}</Button>
              </Link>
            </EmptyState>
          ) : (
            <Text color="text.muted" fontSize="sm">
              {emptyMessage}
            </Text>
          )
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
                  borderColor="border.default"
                  w="full"
                  minH="44px"
                >
                  <HStack align="flex-start" gap={3} minW={0}>
                    <ActivityIcon tone={item.tone} />
                    <Stack gap={0} minW={0}>
                      <Text fontSize="sm" fontWeight={600} lineClamp={1}>
                        {item.title}
                      </Text>
                      <Text fontSize="xs" color="text.muted" lineClamp={1}>
                        {item.subtitle}
                      </Text>
                    </Stack>
                  </HStack>
                  <Text fontSize="xs" color="text.muted" flexShrink={0}>
                    {formatRelativeAgo(item.happenedAt)}
                  </Text>
                </HStack>
              )

              return item.href ? (
                <Link
                  key={item.id}
                  href={item.href}
                  display="block"
                  _hover={{ textDecoration: 'none', bg: 'status.success.soft' }}
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
    </Card>
  )
}

function ActivityIcon({ tone }: { tone: ActivityTone }) {
  const bgByTone = {
    green: 'status.success.soft',
    purple: 'bg.subtle',
    blue: 'status.info.soft',
    mint: 'status.success.soft',
    red: 'status.danger.soft',
  } as const
  const fgByTone = {
    green: 'status.success.fg',
    purple: 'text.muted',
    blue: 'status.info.fg',
    mint: 'status.success.fg',
    red: 'status.danger.fg',
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
      aria-hidden
    >
      ·
    </Box>
  )
}
