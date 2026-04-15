'use client'

import { type BadgeProps, Badge as ChakraBadge } from '@chakra-ui/react'

export type UiBadgeProps = BadgeProps

/** Metadata-style pill; uses semantic `badgeBg` / `badgeFg` (light + dark in theme). Override via props when needed. */
export function Badge(props: UiBadgeProps) {
  return (
    <ChakraBadge
      bg="badgeBg"
      color="badgeFg"
      borderRadius="md"
      borderWidth="0"
      fontFamily="body"
      fontSize="xs"
      fontWeight={600}
      letterSpacing="0.07em"
      textTransform="uppercase"
      px={4}
      py={1.5}
      {...props}
    />
  )
}
