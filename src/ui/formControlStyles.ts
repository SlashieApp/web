import type { BoxProps } from '@chakra-ui/react'
import type { TextProps } from '@chakra-ui/react'

/** Shared bordered field shell — Design-System/inputs.md (8px radius, 40px min height). */
export const formControlRootProps = {
  minH: '40px',
  w: 'full',
  borderRadius: 'md',
  pl: 3,
  pr: 3,
} satisfies BoxProps

/** Default label treatment — 14px medium, heading color, 8px bottom margin. */
export const formControlLabelProps = {
  fontSize: '14px',
  fontWeight: 500,
  color: 'cardFg',
  mb: 2,
} as const

/** Helper copy under fields. */
export const formControlHelperTextProps = {
  fontSize: 'sm',
  color: 'formLabelMuted',
  lineHeight: 'tall',
} satisfies TextProps

/** Multiline field shell aligned with inputs.md. */
export const formControlTextareaProps = {
  borderRadius: 'md',
  px: 3,
  py: 2.5,
  fontSize: '14px',
  minH: '140px',
} as const
