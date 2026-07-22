'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import bag from '../../i11n.json'

import { formatRelativeAgo } from '@/utils/dashboardHelpers'
import { Button, Card, Link, SpotIllustration } from '@ui'

import type {
  ActivityTone,
  NotificationActivityRow,
} from '../../helpers/notificationActivity'

export function InboxActivityPanel({
  rows,
  loading = false,
  emptyMessage,
  emptyActionHref,
  emptyActionLabel,
  title,
  description,
  viewAllHref,
  viewAllLabel,
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
  const t = useI11n(bag)
  const resolvedTitle = title ?? t.inbox.activity
  const resolvedDescription = description ?? t.inbox.description
  const resolvedViewAllLabel = viewAllLabel ?? t.inbox.viewAll
  const resolvedEmptyMessage = emptyMessage ?? t.inbox.empty

  return (
    <Card layout="section" p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <HStack justify="space-between" gap={3} align="flex-start">
          <Stack gap={1}>
            <Text fontWeight={700} fontSize="md" color="text.default">
              {resolvedTitle}
            </Text>
            <Text fontSize="sm" color="text.muted">
              {resolvedDescription}
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
              {resolvedViewAllLabel}
            </Link>
          ) : null}
        </HStack>

        {loading && rows.length === 0 ? (
          <Text as="output" color="text.muted" fontSize="sm">
            {t.inbox.loading}
          </Text>
        ) : rows.length === 0 ? (
          emptyActionHref && emptyActionLabel ? (
            <Stack align="center" textAlign="center" gap={3} py={2} w="full">
              <SpotIllustration variant="quotes" width={120} />
              <Text fontSize="lg" fontWeight={600} color="text.default">
                {resolvedEmptyMessage}
              </Text>
              <Link href={emptyActionHref} _hover={{ textDecoration: 'none' }}>
                <Button size="sm">{emptyActionLabel}</Button>
              </Link>
            </Stack>
          ) : (
            <Text color="text.muted" fontSize="sm">
              {resolvedEmptyMessage}
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
