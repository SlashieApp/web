'use client'

import { Box, Text } from '@chakra-ui/react'
import * as React from 'react'

import { Textarea, type TextareaProps } from '../Textarea/Textarea'
import { formControlTextareaProps } from '../formControlStyles'

export type CharCountTextareaProps = TextareaProps & {
  value: string
  maxLength: number
}

/**
 * Multiline field with an in-field character counter (bottom-right), matching
 * worker profile and marketplace form patterns.
 */
export const CharCountTextarea = React.forwardRef<
  HTMLTextAreaElement,
  CharCountTextareaProps
>(function CharCountTextarea(
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

CharCountTextarea.displayName = 'CharCountTextarea'
