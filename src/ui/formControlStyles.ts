import type { BoxProps } from '@chakra-ui/react'
import type { TextProps } from '@chakra-ui/react'

/** Shared bordered field shell — matches Slashie marketplace forms (8px radius, 48px height). */
export const formControlRootProps = {
  minH: '48px',
  w: 'full',
  borderRadius: 'md',
  pl: 3,
  pr: 3,
} satisfies BoxProps

/** Default label treatment for marketplace forms (sentence case, bold). */
export const formControlLabelProps = {
  fontSize: 'sm',
  fontWeight: 700,
  color: 'cardFg',
  mb: 0,
} as const

/** Helper copy under fields. */
export const formControlHelperTextProps = {
  fontSize: 'sm',
  color: 'formLabelMuted',
  lineHeight: 'tall',
} satisfies TextProps

/** Multiline field shell aligned with {@link formControlRootProps}. */
export const formControlTextareaProps = {
  borderRadius: 'md',
  px: 4,
  py: 3,
  fontSize: 'md',
  minH: '140px',
} as const
