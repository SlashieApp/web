'use client'

import { Box, Text, type TextProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

/**
 * The look of an error under a control (FE-481): 12px on a 16px line, weight
 * 500, danger, a dot before it (status is not by colour alone). `FormField`
 * draws its own error with these props; a group that is not a `FormField`
 * control (a choice group, the Min and Max pair) reads them through
 * {@link FormErrorText}, so every error under a control is one style and sits
 * `controlToHelper` (4) under it on the same compact line.
 */
export const formControlErrorTextProps = {
  color: 'status.danger.fg',
  fontSize: 'xs',
  lineHeight: '16px',
  fontWeight: 500,
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  px: 1,
} as const satisfies TextProps

/** The dot before an error: a shape beside the colour. */
export function FormErrorDot() {
  return (
    <Box
      as="span"
      aria-hidden
      flexShrink={0}
      boxSize="6px"
      borderRadius="full"
      bg="status.danger.solid"
    />
  )
}

/**
 * An error under a control that is not a `FormField` (a choice group, a pair of
 * fields): the same line as a field's error, announced when it appears
 * (`role="alert"`). Give it the `id` the group's `aria-describedby` names.
 */
export function FormErrorText({
  children,
  ...props
}: Omit<TextProps, 'children'> & { children: ReactNode }) {
  return (
    <Text role="alert" {...formControlErrorTextProps} {...props}>
      <FormErrorDot />
      {children}
    </Text>
  )
}
