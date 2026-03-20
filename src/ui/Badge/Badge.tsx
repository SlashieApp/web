'use client'

import { type BadgeProps, Badge as ChakraBadge } from '@chakra-ui/react'

export type UiBadgeProps = BadgeProps

export function Badge(props: UiBadgeProps) {
  return (
    <ChakraBadge
      bg="secondaryFixed"
      color="onSecondaryFixed"
      borderRadius="999px"
      fontWeight={600}
      letterSpacing="0.01em"
      px={3}
      py={1}
      {...props}
    />
  )
}
