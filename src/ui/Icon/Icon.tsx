'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export type IconColor = 'primary' | 'tertiary' | 'danger'

function iconColorToken(c: IconColor): string {
  switch (c) {
    case 'primary':
      return 'intentPrimaryFg'
    case 'tertiary':
      return 'intentTertiaryFg'
    case 'danger':
      return 'intentDangerFg'
    default: {
      const _x: never = c
      return _x
    }
  }
}

export type IconProps = Omit<BoxProps, 'children' | 'color'> & {
  /** Semantic tint; forwarded as Chakra `color` so SVGs can use `currentColor`. */
  color: IconColor
  children: ReactNode
}

/**
 * Wraps an inline SVG or icon glyph with a Slashie semantic tint.
 * Children should use `currentColor` for strokes/fills where possible.
 */
export function Icon({
  color,
  children,
  boxSize = '20px',
  lineHeight = 0,
  ...rest
}: IconProps) {
  return (
    <Box
      as="span"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      boxSize={boxSize}
      lineHeight={lineHeight}
      color={iconColorToken(color)}
      {...rest}
    >
      {children}
    </Box>
  )
}
