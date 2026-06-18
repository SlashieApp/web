'use client'

import {
  Textarea as ChakraTextarea,
  type TextareaProps as ChakraTextareaProps,
} from '@chakra-ui/react'
import * as React from 'react'

import { formControlFieldInteraction } from '../interactionStyles'

export type TextareaProps = ChakraTextareaProps

/**
 * Multiline text field sharing the same bordered shell, padding, and green
 * focus treatment as {@link Input} via the `formControl*` tokens. Pair with
 * {@link FormField} for labels and errors.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(props, ref) {
    return (
      <ChakraTextarea
        ref={ref}
        pointerEvents="auto"
        minH="140px"
        px={4}
        py={3}
        fontSize="md"
        borderRadius="md"
        borderWidth="1px"
        borderColor="formControlBorder"
        bg="formControlBg"
        color="formControlFg"
        _placeholder={{ color: 'formControlPlaceholder' }}
        {...formControlFieldInteraction}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'
