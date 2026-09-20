'use client'
import { Box, HStack, Text } from '@chakra-ui/react'

import { Link } from '@ui'

export function InboxUpcomingEventRow({
  href: path,
  title,
  timeLabel,
  status,
}: {
  href: string
  title: string
  timeLabel: string
  status: 'booked' | 'upcoming'
}) {
  return (
    <Link
      href={path}
      display="block"
      px={2}
      py={2}
      borderRadius="md"
      _hover={{ textDecoration: 'none', bg: 'status.success.soft' }}
    >
      <HStack gap={2} align="center" minW={0}>
        <StatusDot status={status} />
        <Text fontSize="sm" fontWeight={600} lineClamp={1} flex={1} minW={0}>
          {title}
        </Text>
        <Text fontSize="xs" color="text.muted" flexShrink={0}>
          {timeLabel}
        </Text>
      </HStack>
    </Link>
  )
}

function StatusDot({ status }: { status: 'booked' | 'upcoming' }) {
  return (
    <Box
      w="6px"
      h="6px"
      borderRadius="full"
      bg={status === 'booked' ? 'status.success.solid' : 'status.info.solid'}
      flexShrink={0}
    />
  )
}
