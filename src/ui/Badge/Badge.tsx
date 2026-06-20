'use client'

import { type BadgeProps, Badge as ChakraBadge } from '@chakra-ui/react'

import {
  type UiBadgeShape,
  type UiBadgeSize,
  type UiBadgeVariant,
  badgeSizeStyles,
  badgeVariantStyles,
} from '../designSystemStyles'

export type { UiBadgeVariant, UiBadgeSize, UiBadgeShape }

export type UiBadgeProps = Omit<BadgeProps, 'variant'> & {
  /** Design-System badge tint. Default `brand`. */
  variant?: UiBadgeVariant
  size?: UiBadgeSize
  shape?: UiBadgeShape
}

/** Metadata / status pill aligned to Design-System/badges.md. */
export function Badge({
  variant = 'brand',
  size = 'sm',
  shape = 'default',
  borderRadius,
  borderWidth = '1px',
  fontFamily = 'body',
  fontWeight = 500,
  letterSpacing = 'normal',
  textTransform = 'none',
  ...props
}: UiBadgeProps) {
  return (
    <ChakraBadge
      borderRadius={borderRadius ?? (shape === 'pill' ? 'full' : 'md')}
      {...badgeVariantStyles(variant)}
      {...badgeSizeStyles(size)}
      borderWidth={borderWidth}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      textTransform={textTransform}
      {...props}
    />
  )
}
