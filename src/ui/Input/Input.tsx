'use client'

import {
  Box,
  Input as ChakraInput,
  type InputProps as ChakraInputProps,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'
import * as React from 'react'

import {
  formControlFieldRingless,
  formControlShellInteraction,
} from '@/theme/system'
import {
  formControlInvalidShellProps,
  useFormControlMinH,
  useFormFieldControlProps,
} from '../FormField/formFieldContext'

export type InputProps = ChakraInputProps & {
  /** Optional leading content (icon, text) inside the bordered shell. */
  startElement?: ReactNode
  /** Optional trailing content (icon button, etc.) inside the bordered shell. */
  endElement?: ReactNode
  /** Props merged onto the outer bordered container. */
  rootProps?: Omit<React.ComponentProps<typeof Box>, 'children'>
  /** A search field is a pill; every other field has 8px corners. */
  pill?: boolean
}

/**
 * Bordered text field with optional start/end slots. The native input is
 * borderless inside the shell; focus ring is expressed via the shell border.
 * The shell is 48px tall in a `FormField` (a form), 44px on its own.
 *
 * The whole shell is the target (FE-481), as it is for {@link Select}: the
 * native input fills it edge to edge, and carries the padding on any side that
 * has no slot, so a press on the strip above and below the text or on the
 * left and right padding lands in the field, with the caret where it fell.
 * Only a slot (an icon, a button) is outside the target. A caller's
 * `rootProps` padding applies to the sides that have a slot.
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      startElement,
      endElement,
      rootProps,
      pill = false,
      disabled,
      required,
      id,
      ...inputProps
    },
    ref,
  ) {
    const { invalid, ...controlProps } = useFormFieldControlProps({
      id,
      disabled,
      required,
      'aria-describedby': inputProps['aria-describedby'],
    })
    const minH = useFormControlMinH()
    const hasStart = startElement != null
    const hasEnd = endElement != null

    return (
      <Box
        pointerEvents="auto"
        display="flex"
        alignItems="stretch"
        gap={1}
        w="full"
        minH={minH}
        borderRadius={pill ? 'full' : 'md'}
        borderWidth="1px"
        borderColor="border.strong"
        bg="bg.surface"
        // A side with a slot keeps the shell's padding; a side without is the
        // input's own, so the input reaches the border there.
        pl={hasStart ? (pill ? 4 : 3) : 0}
        pr={hasEnd ? 3 : 0}
        {...formControlShellInteraction}
        {...formControlInvalidShellProps(invalid)}
        {...(controlProps.disabled
          ? {
              bg: 'bg.subtle',
              borderColor: 'border.default',
              boxShadow: 'none',
              cursor: 'not-allowed',
              _hover: { borderColor: 'border.default' },
            }
          : null)}
        {...rootProps}
      >
        {startElement != null ? (
          <Box
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="text.muted"
            px={1}
          >
            {startElement}
          </Box>
        ) : null}
        <ChakraInput
          ref={ref}
          {...inputProps}
          {...controlProps}
          flex={1}
          minW={0}
          borderWidth={0}
          boxShadow="none"
          bg="transparent"
          color="text.default"
          h="auto"
          minH={0}
          py={2.5}
          // The text sits where it always has: 12 (16 for a pill) from the
          // border and 4 more, or 4 from a slot.
          pl={hasStart ? 1 : pill ? 5 : 4}
          pr={hasEnd ? 1 : 4}
          _placeholder={{ color: 'text.subtle' }}
          _disabled={{ color: 'text.subtle', cursor: 'not-allowed' }}
          {...formControlFieldRingless}
        />
        {endElement != null ? (
          <Box
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {endElement}
          </Box>
        ) : null}
      </Box>
    )
  },
)

Input.displayName = 'Input'
