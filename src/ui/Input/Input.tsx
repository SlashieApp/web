'use client'

import { Input as ChakraInput, type InputProps } from '@chakra-ui/react'

export type InputComponentProps = InputProps

export function Input(props: InputComponentProps) {
  return (
    <ChakraInput
      px={{ base: 3, md: 4 }}
      py={2.5}
      bg="surfaceContainerLowest"
      borderRadius="lg"
      borderWidth="0"
      boxShadow="ghostBorder"
      _focusVisible={{
        boxShadow:
          'inset 0 -2px 0 #003fb1, 0 0 0 3px rgba(0, 63, 177, 0.15), inset 0 0 0 1px rgba(195, 197, 215, 0.15)',
      }}
      {...props}
    />
  )
}
