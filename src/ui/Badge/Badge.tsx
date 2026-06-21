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
  | 'blue'
  | 'danger'
  | 'success'
  | 'warning'

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
    case 'blue':
      return {
        bg: 'statusInfoBg',
        color: 'statusInfoFg',
        borderColor: 'statusInfoBorder',
      }
    case 'danger':
      return {
        bg: 'statusDangerBg',
        color: 'statusDangerFg',
        borderColor: 'statusDangerBorder',
      }
    case 'success':
      return {
        bg: 'statusSuccessBg',
        color: 'statusSuccessFg',
        borderColor: 'statusSuccessBorder',
      }
    case 'warning':
      return {
        bg: 'statusWarningBg',
        color: 'statusWarningFg',
        borderColor: 'statusWarningBorder',
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
