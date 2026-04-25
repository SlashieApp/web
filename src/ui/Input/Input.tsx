'use client'

import {
  Box,
  Input as ChakraInput,
  type InputProps as ChakraInputProps,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'

export type InputProps = ChakraInputProps & {
  /** Optional leading content (icon, text) inside the bordered shell. */
  startElement?: ReactNode
  /** Optional trailing content (icon button, etc.) inside the bordered shell. */
  endElement?: ReactNode
  /** Props merged onto the outer bordered container. */
  rootProps?: Omit<React.ComponentProps<typeof Box>, 'children'>
}

/**
 * Bordered text field with optional start/end slots. The native input is
 * borderless inside the shell; focus ring is expressed via the shell border.
 */
export function Input({
  startElement,
  endElement,
  rootProps,
  ...inputProps
}: InputProps) {
  return (
    <Box
      pointerEvents="auto"
      display="flex"
      alignItems="center"
      gap={1}
      minH={{ base: 10, md: 11 }}
      borderRadius={{ base: 'lg', md: 'xl' }}
      borderWidth="1px"
      borderColor="formControlBorder"
      bg="formControlBg"
      pl={2}
      pr={1}
      transitionProperty="border-color"
      transitionDuration="160ms"
      _focusWithin={{
        borderColor: 'formControlFocusBorder',
      }}
      {...rootProps}
    >
      {startElement != null ? (
        <Box
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          color="formControlIcon"
          px={1}
        >
          {startElement}
        </Box>
      ) : null}
      <ChakraInput
        {...inputProps}
        flex={1}
        minW={0}
        borderWidth={0}
        boxShadow="none"
        outline="none"
        bg="transparent"
        color="formControlFg"
        h="auto"
        minH={0}
        py={2}
        px={1}
        _placeholder={{ color: 'formControlPlaceholder' }}
        _focus={{ borderWidth: 0, boxShadow: 'none' }}
        _focusVisible={{ borderWidth: 0, boxShadow: 'none' }}
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
}
