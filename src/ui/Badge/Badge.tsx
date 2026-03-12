'use client'

import { type BadgeProps, Badge as ChakraBadge } from '@chakra-ui/react'

export type UiBadgeProps = BadgeProps

export function Badge(props: UiBadgeProps) {
  return (
    <ChakraBadge
      borderRadius="999px"
      fontWeight={600}
      px={3}
      py={1}
      {...props}
    />
  )
}
