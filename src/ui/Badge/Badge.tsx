'use client'

import { type BadgeProps, Badge as ChakraBadge } from '@chakra-ui/react'

export type UiBadgeProps = BadgeProps

/** Metadata-style pill; uses semantic `badgeBg` / `badgeFg` (light + dark in theme). Override via props when needed. */
export function Badge(props: UiBadgeProps) {
  return (
    <ChakraBadge
      bg="badgeBg"
      color="badgeFg"
      borderRadius="sm"
      borderWidth="0"
      fontFamily="body"
      fontSize="xs"
      fontWeight={600}
      letterSpacing="0.07em"
      px={2.5}
      py={0.5}
      {...props}
    />
  )
}
