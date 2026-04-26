'use client'

import { HStack, Text } from '@chakra-ui/react'

export type RatingProps = {
  value: string
}

export function Rating({ value }: RatingProps) {
  return (
    <HStack gap={1} flexShrink={0}>
      <Text
        as="span"
        color="mustard.400"
        fontSize="xs"
        lineHeight="1"
        aria-hidden
      >
        ★
      </Text>
      <Text fontSize="sm" fontWeight={600} color="cardMutedFg">
        {value}
      </Text>
    </HStack>
  )
}
