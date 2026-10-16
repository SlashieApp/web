'use client'

import { HStack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { useI11n } from '@/i18n/useI11n'
import { Badge } from '@ui'

import bag from '../../../i11n.json'

export function WorkerSetupOptionalBadge() {
  return (
    <Badge variant="neutral" shape="pill">
      {useI11n(bag).optional}
    </Badge>
  )
}

/** A field label with an Optional badge. */
export function WorkerSetupOptionalLabel({
  children,
}: { children: ReactNode }) {
  return (
    <HStack as="span" gap={2} align="center">
      <Text as="span">{children}</Text>
      <WorkerSetupOptionalBadge />
    </HStack>
  )
}
