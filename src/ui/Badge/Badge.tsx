'use client'

import {
  type BadgeProps,
  Box,
  Badge as ChakraBadge,
  type SystemStyleObject,
} from '@chakra-ui/react'

/**
 * SDL Badge, the tag: a pill with a 12px 500 label and a 1px border from its
 * family (`status.<family>.border`; neutral uses `border.default`). Categories
 * are neutral; green is for state (Open, Quoted, Accepted). Status is never
 * signalled by color alone: pass `dot` so every status chip shows a dot + label.
 */
export type UiBadgeVariant =
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  // legacy aliases (migration)
  | 'alternative'
  | 'gray'
  | 'blue'

export type UiBadgeSize = 'sm' | 'lg'
/** Both shapes are a pill since the tone refresh; kept so call sites need no change. */
export type UiBadgeShape = 'default' | 'pill'

export type UiBadgeProps = Omit<BadgeProps, 'variant' | 'size'> & {
  variant?: UiBadgeVariant
  size?: UiBadgeSize
  shape?: UiBadgeShape
  /** Render a leading status dot (recommended for status meanings). */
  dot?: boolean
}

type SdlFamily = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const familyAlias: Record<UiBadgeVariant, SdlFamily> = {
  brand: 'success',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  blue: 'info',
  neutral: 'neutral',
  gray: 'neutral',
  alternative: 'neutral',
}

function familyStyles(family: SdlFamily): SystemStyleObject {
  if (family === 'neutral') {
    return {
      bg: 'bg.subtle',
      color: 'text.muted',
      borderColor: 'border.default',
    }
  }
  return {
    bg: `status.${family}.soft`,
    color: `status.${family}.fg`,
    borderColor: `status.${family}.border`,
  }
}

/**
 * `sm` is the app's Badge box (FE-442): 8px sides, 3px above and below, and
 * the 12/18 caption line, so 26px tall with the 1px border. The font stays
 * the web `xs`.
 */
const badgeSizes: Record<UiBadgeSize, SystemStyleObject> = {
  sm: { fontSize: 'xs', px: 2, py: '3px', gap: 1.5, lineHeight: '1.5' },
  lg: { fontSize: 'sm', px: 2.5, py: 1, gap: 2 },
}

export function Badge({
  variant = 'neutral',
  size = 'sm',
  shape: _shape,
  dot = false,
  borderRadius = 'full',
  borderWidth = '1px',
  fontFamily = 'body',
  fontWeight = 500,
  letterSpacing = 'normal',
  textTransform = 'none',
  children,
  ...props
}: UiBadgeProps) {
  const family = familyAlias[variant]
  return (
    <ChakraBadge
      display="inline-flex"
      alignItems="center"
      lineHeight="1.35"
      borderRadius={borderRadius}
      borderWidth={borderWidth}
      fontFamily={fontFamily}
      fontWeight={fontWeight}
      letterSpacing={letterSpacing}
      textTransform={textTransform}
      {...familyStyles(family)}
      {...badgeSizes[size]}
      {...props}
    >
      {dot ? (
        <Box
          as="span"
          aria-hidden
          boxSize="6px"
          borderRadius="full"
          bg={family === 'neutral' ? 'text.muted' : `status.${family}.solid`}
        />
      ) : null}
      {children}
    </ChakraBadge>
  )
}
