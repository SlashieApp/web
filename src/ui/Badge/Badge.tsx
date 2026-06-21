'use client'

import {
  type BadgeProps,
  Badge as ChakraBadge,
  type SystemStyleObject,
} from '@chakra-ui/react'

export type UiBadgeVariant =
  | 'brand'
  | 'alternative'
  | 'gray'
  | 'danger'
  | 'success'
  | 'warning'
  | 'dark'

export type UiBadgeSize = 'sm' | 'lg'
export type UiBadgeShape = 'default' | 'pill'

export type UiBadgeProps = Omit<BadgeProps, 'variant'> & {
  /** Design-System badge tint. Default `brand`. */
  variant?: UiBadgeVariant
  size?: UiBadgeSize
  shape?: UiBadgeShape
}

const badgeSizes: Record<UiBadgeSize, SystemStyleObject> = {
  sm: { fontSize: '12px', px: 1.5, py: 0.5 },
  lg: { fontSize: '14px', px: 2, py: 1 },
}

function badgeVariantStyles(
  variant: UiBadgeVariant = 'brand',
): SystemStyleObject {
  switch (variant) {
    case 'brand':
      return {
        bg: 'badgeBg',
        color: 'badgeFg',
        borderColor: 'primary.300',
      }
    case 'alternative':
      return {
        bg: 'cardBg',
        color: 'cardFg',
        borderColor: 'cardBorder',
      }
    case 'gray':
      return {
        bg: 'formControlBg',
        color: 'cardFg',
        borderColor: 'formControlBorder',
      }
    case 'danger':
      return {
        bg: '#FEE2E2',
        color: '#B91C1C',
        borderColor: '#FECACA',
      }
    case 'success':
      return {
        bg: '#DCFCE7',
        color: '#15803D',
        borderColor: '#BBF7D0',
      }
    case 'warning':
      return {
        bg: '#FEF3C7',
        color: '#B45309',
        borderColor: '#FDE68A',
      }
    case 'dark':
      return {
        bg: 'neutral.900',
        color: 'white',
        borderColor: 'transparent',
      }
    default:
      return {}
  }
}

function badgeSizeStyles(size: UiBadgeSize = 'sm') {
  return badgeSizes[size]
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
