'use client'

import type { BoxProps } from '@chakra-ui/react'
import { createContext, useContext } from 'react'

export type FormFieldState = {
  /** Id for the native control (`htmlFor` / `id` wiring). */
  controlId: string
  invalid: boolean
  disabled: boolean
  required: boolean
  errorText?: string
  helperText?: string
  /** Space-separated ids for `aria-describedby`. */
  describedBy?: string
}

const FormFieldContext = createContext<FormFieldState | null>(null)

/** Field state from the nearest {@link FormField}. `null` outside a field. */
export function useFormField() {
  return useContext(FormFieldContext)
}

export type FormFieldControlProps = {
  id?: string
  disabled?: boolean
  required?: boolean
  'aria-describedby'?: string
}

/** Merge explicit control props with the nearest {@link FormField} state. */
export function useFormFieldControlProps(
  overrides: FormFieldControlProps = {},
) {
  const field = useFormField()

  const describedBy = [overrides['aria-describedby'], field?.describedBy]
    .filter(Boolean)
    .join(' ')

  const invalid = field?.invalid ?? false

  return {
    id: overrides.id ?? field?.controlId,
    disabled: overrides.disabled ?? field?.disabled ?? false,
    required: overrides.required ?? field?.required ?? false,
    invalid,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': invalid ? true : undefined,
  } as const
}

/** Error border treatment for bordered control shells (`Input`, `Select`). */
export function formControlInvalidShellProps(invalid: boolean): BoxProps {
  if (!invalid) return {}
  return {
    borderColor: 'red.500',
    _hover: { borderColor: 'red.500' },
    _focusWithin: { borderColor: 'red.500' },
  }
}

/** Error border treatment for standalone bordered fields (`Textarea`). */
export function formControlInvalidFieldProps(invalid: boolean): BoxProps {
  if (!invalid) return {}
  return {
    borderColor: 'red.500',
    _hover: { borderColor: 'red.500' },
    _focusVisible: {
      borderColor: 'red.500',
      outline: 'none',
      boxShadow: 'none',
    },
  }
}

/** @internal Provider context for {@link FormField}. */
export const FormFieldStateContext = FormFieldContext
