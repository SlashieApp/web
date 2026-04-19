'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

/** Semantic color group; `null` is neutral grey (metadata-style). */
export type TagColor = 'primary' | 'tertiary' | 'danger' | null

export type TagVariant = 'default' | 'ghost'

type ColorTokens = {
  fg: string
  border: string
  bg: string
}

function colorTokens(color: TagColor): ColorTokens {
  switch (color) {
    case 'primary':
      return {
        fg: 'tagActiveFg',
        border: 'tagActiveBorder',
        bg: 'tagActiveBg',
      }
    case 'tertiary':
      return {
        fg: 'tagPendingFg',
        border: 'tagPendingBorder',
        bg: 'tagPendingBg',
      }
    case 'danger':
      return {
        fg: 'tagUrgentFg',
        border: 'tagUrgentBorder',
        bg: 'tagUrgentBg',
      }
    case null:
      return {
        fg: 'badgeFg',
        border: 'cardBorder',
        bg: 'badgeBg',
      }
    default: {
      const _x: never = color
      return _x
    }
  }
}

function resolveColor(color: TagColor | undefined): TagColor {
  if (color === null) return null
  return color ?? 'primary'
}

export type TagProps = Omit<BoxProps, 'children'> & {
  /**
   * Filled pill with border (`default`) or transparent label row (`ghost`).
   * `color` and `icon` are supported for **both** variants.
   */
  variant?: TagVariant
  /** Tint for text, icon, and (on `default`) pill surface. `null` = grey metadata. */
  color?: TagColor
  /** Optional leading icon (any variant); use `currentColor` in SVGs when possible. */
  icon?: ReactNode
  children: ReactNode
}

/** Status / metadata label. Both `default` and `ghost` accept `color` and `icon`. */
export function Tag({
  variant = 'default',
  color,
  icon,
  children,
  gap = 1.5,
  ...rest
}: TagProps) {
  const c = resolveColor(color)
  const t = colorTokens(c)
  const isGhost = variant === 'ghost'

  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      columnGap={gap}
      w="fit-content"
      borderRadius="full"
      borderWidth={isGhost ? '0' : '1px'}
      borderColor={isGhost ? 'transparent' : t.border}
      bg={isGhost ? 'transparent' : t.bg}
      color={t.fg}
      px={isGhost ? 0 : 4}
      py={isGhost ? 0 : 1.5}
      fontFamily={isGhost ? 'body' : 'heading'}
      fontSize={isGhost ? 'sm' : 'xs'}
      fontWeight={isGhost ? 600 : 700}
      letterSpacing={isGhost ? 'normal' : '0.06em'}
      textTransform={isGhost ? 'none' : 'uppercase'}
      lineHeight={isGhost ? 'short' : '1.2'}
      {...rest}
    >
      {icon ? (
        <Box
          as="span"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          lineHeight={0}
          color="inherit"
        >
          {icon}
        </Box>
      ) : null}
      {children}
    </Box>
  )
}
