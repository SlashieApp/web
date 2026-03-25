'use client'

import type { ReactNode } from 'react'

import { FieldErrorText, FieldLabel, FieldRoot, Text } from '@chakra-ui/react'

export type FormFieldProps = {
  label: ReactNode
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
      <FieldLabel fontSize="sm" fontWeight={700} color="fg">
        {label}
      </FieldLabel>
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
