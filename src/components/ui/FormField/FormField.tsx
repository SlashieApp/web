'use client'

import { FieldRoot, FieldLabel, FieldErrorText, Text } from '@chakra-ui/react'

export type FormFieldProps = {
  label: string
  helperText?: string
  errorText?: string
  children: React.ReactNode
} & Omit<React.ComponentProps<typeof FieldRoot>, 'children'>

export function FormField({
  label,
  helperText,
  errorText,
  children,
  ...props
}: FormFieldProps) {
  return (
    <FieldRoot invalid={Boolean(errorText)} {...props}>
      <FieldLabel>{label}</FieldLabel>
      {children}
      {helperText ? (
        <Text fontSize="sm" color="muted">
          {helperText}
        </Text>
      ) : null}
      {errorText ? <FieldErrorText>{errorText}</FieldErrorText> : null}
    </FieldRoot>
  )
}
