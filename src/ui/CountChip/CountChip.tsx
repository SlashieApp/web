'use client'

import { HStack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

/**
 * SDL CountChip — a compact, neutral metadata chip with an optional leading icon
 * and a short count/label (e.g. "0 quotes so far"). Soft neutral surface; not a
 * status pill. References SDL roles only.
 */
export type CountChipProps = {
  /** Optional leading icon (decorative). */
  icon?: ReactNode
  children: ReactNode
}

export function CountChip({ icon, children }: CountChipProps) {
  return (
    <HStack
      as="span"
      display="inline-flex"
      gap={1.5}
      px={2.5}
      py={1}
      borderRadius="full"
      bg="bg.subtle"
      color="text.muted"
      borderWidth="1px"
      borderColor="border.default"
    >
      <Text as="span" fontSize="sm" fontWeight={600} lineHeight="1.2">
        {children}
      </Text>
      {icon ? (
        <Text as="span" display="inline-flex" aria-hidden fontSize="sm">
          {icon}
        </Text>
      ) : null}
    </HStack>
  )
}
