'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'

import { Badge } from '@ui'

export function WorkerSetupOptionalBadge() {
  return (
    <Badge
      bg="neutral.100"
      color="text.muted"
      fontSize="xs"
      fontWeight={600}
      letterSpacing="normal"
      textTransform="none"
      px={2}
      py={0.5}
      borderRadius="md"
    >
      Optional
    </Badge>
  )
}

export function WorkerSetupOptionalLabel({ children }: { children: string }) {
  return (
    <HStack gap={2} align="center">
      <Text as="span">{children}</Text>
      <WorkerSetupOptionalBadge />
    </HStack>
  )
}
