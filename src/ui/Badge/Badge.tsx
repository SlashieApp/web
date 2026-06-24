'use client'

import {
  type BadgeProps,
  Box,
  Badge as ChakraBadge,
  type SystemStyleObject,
} from '@chakra-ui/react'

/**
 * SDL Badge / StatusPill. Status is never signalled by color alone — pass `dot`
 * (or use `StatusPill`) so every status chip shows a dot + label.
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
    borderColor: `status.${family}.soft`,
  }
}

const badgeSizes: Record<UiBadgeSize, SystemStyleObject> = {
  sm: { fontSize: 'xs', px: 2, py: 0.5, gap: 1.5 },
  lg: { fontSize: 'sm', px: 2.5, py: 1, gap: 2 },
}

export function Badge({
  variant = 'brand',
  size = 'sm',
  shape = 'default',
  dot = false,
  borderRadius,
  borderWidth = '1px',
  fontFamily = 'body',
  fontWeight = 600,
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
      borderRadius={borderRadius ?? (shape === 'pill' ? 'full' : 'md')}
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

/** TaskStatus → SDL status family (always renders a dot + label). */
export type TaskStatusValue = 'OPEN' | 'AWARDED' | 'CLOSED' | 'CANCELLED'

const taskStatusMap: Record<
  TaskStatusValue,
  { family: UiBadgeVariant; label: string }
> = {
  OPEN: { family: 'success', label: 'Open' },
  AWARDED: { family: 'warning', label: 'Awarded' },
  CLOSED: { family: 'info', label: 'Closed' },
  CANCELLED: { family: 'danger', label: 'Cancelled' },
}

export type StatusPillProps = Omit<
  UiBadgeProps,
  'variant' | 'dot' | 'children'
> & {
  status: TaskStatusValue
  label?: string
}

export function StatusPill({ status, label, ...props }: StatusPillProps) {
  const { family, label: defaultLabel } = taskStatusMap[status]
  return (
    <Badge variant={family} dot shape="pill" {...props}>
      {label ?? defaultLabel}
    </Badge>
  )
}
