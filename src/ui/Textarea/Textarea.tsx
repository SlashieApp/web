'use client'

import {
  Textarea as ChakraTextarea,
  type TextareaProps as ChakraTextareaProps,
} from '@chakra-ui/react'
import * as React from 'react'

import { formControlFieldInteraction, sdlMotion } from '@/theme/styles'
import {
  formControlInvalidFieldProps,
  useFormFieldControlProps,
} from '../FormField/formFieldContext'

export type TextareaProps = ChakraTextareaProps

/**
 * SDL multiline text field. Shares the same bordered shell, padding, and
 * green focus treatment as {@link Input}, expressed through SDL semantic roles
 * (`bg.surface`, `border.default`, `text.default`, `text.subtle`).
 *
 * Focus is signalled by a visible ring driven by `border.focus`
 * (`formControlFieldInteraction`), so keyboard users get WCAG 2.2 AA focus
 * visibility. Errors are tied to the field via `aria-describedby` /
 * `aria-invalid` rather than relying on the placeholder as a label — always
 * pair with a persistent {@link FormField} `<label>`.
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
        w="full"
        minH="140px"
        px={3}
        py={2.5}
        borderRadius="md"
        borderWidth="1px"
        borderColor="border.default"
        bg="bg.surface"
        color="text.default"
        fontFamily="body"
        transitionTimingFunction={sdlMotion.easing.standard}
        _placeholder={{ color: 'text.subtle' }}
        _disabled={{
          bg: 'bg.subtle',
          color: 'text.subtle',
          borderColor: 'border.default',
          cursor: 'not-allowed',
          opacity: 1,
        }}
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
