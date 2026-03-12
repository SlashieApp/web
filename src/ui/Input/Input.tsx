'use client'

import { Input as ChakraInput, type InputProps } from '@chakra-ui/react'

export type InputComponentProps = InputProps

export function Input(props: InputComponentProps) {
  return (
    <ChakraInput
      px={{ base: 3, md: 4 }}
      py={2}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="border"
      _focusVisible={{
        borderColor: 'linkBlue.600',
        boxShadow: '0 0 0 4px rgba(29,78,216,0.15)',
      }}
      {...props}
    />
  )
}
