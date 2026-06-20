'use client'

import {
  Textarea as ChakraTextarea,
  type TextareaProps as ChakraTextareaProps,
} from '@chakra-ui/react'
import * as React from 'react'

import {
  formControlInvalidFieldProps,
  useFormFieldControlProps,
} from '../FormField/formFieldContext'
import { formControlFieldInteraction } from '../interactionStyles'

export type TextareaProps = ChakraTextareaProps

/**
 * Multiline text field sharing the same bordered shell, padding, and green
 * focus treatment as {@link Input} via the `formControl*` tokens. Pair with
 * {@link FormField} for labels and errors.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ disabled, required, id, ...props }, ref) {
    const control = useFormFieldControlProps({
      id,
      disabled,
      required,
      'aria-describedby': props['aria-describedby'],
    })

    return (
      <ChakraTextarea
        ref={ref}
        pointerEvents="auto"
        minH="140px"
        px={3}
        py={2.5}
        borderRadius="md"
        borderWidth="1px"
        borderColor="formControlBorder"
        bg="formControlBg"
        color="formControlFg"
        _placeholder={{ color: 'formControlPlaceholder' }}
        {...formControlFieldInteraction}
        {...formControlInvalidFieldProps(control.invalid)}
        {...props}
        id={control.id}
        disabled={control.disabled}
        required={control.required}
        aria-describedby={control['aria-describedby']}
        aria-invalid={control['aria-invalid']}
      />
    )
  },
)

Textarea.displayName = 'Textarea'
