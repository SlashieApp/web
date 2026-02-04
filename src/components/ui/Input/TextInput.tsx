'use client'

import { Input, type InputProps } from '@chakra-ui/react'

export type TextInputProps = InputProps

export function TextInput(props: TextInputProps) {
  return (
    <Input
      borderRadius="xl"
      bg="glassBg"
      borderColor="glassBorder"
      _focusVisible={{
        borderColor: 'linkBlue.600',
        boxShadow: '0 0 0 4px rgba(29,78,216,0.15)',
      }}
      {...props}
    />
  )
}
