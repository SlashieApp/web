'use client'

import { Box, Text } from '@chakra-ui/react'
import * as React from 'react'

import { Textarea, type TextareaProps } from '../Textarea/Textarea'
import { formControlTextareaProps } from '../formControlStyles'

export type FormFieldCharCountTextareaProps = TextareaProps & {
  value: string
  maxLength: number
}

/**
 * {@link Textarea} control slot with an in-field character counter.
 * Pair with {@link FormField} for label, helper, and error copy.
 */
export const FormFieldCharCountTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormFieldCharCountTextareaProps
>(function FormFieldCharCountTextarea(
  { value, maxLength, pb = 10, ...textareaProps },
  ref,
) {
  return (
    <Box position="relative" w="full">
      <Textarea
        ref={ref}
        value={value}
        maxLength={maxLength}
        pb={pb}
        {...formControlTextareaProps}
        {...textareaProps}
      />
      <Text
        position="absolute"
        bottom={3}
        right={4}
        fontSize="xs"
        color="formLabelMuted"
        pointerEvents="none"
        aria-hidden
      >
        {value.length} / {maxLength}
      </Text>
    </Box>
  )
})

FormFieldCharCountTextarea.displayName = 'FormFieldCharCountTextarea'
