'use client'

import { Input, type InputProps } from '@chakra-ui/react'

export type TextInputProps = InputProps

export function TextInput(props: TextInputProps) {
  return (
    <Input
      borderRadius="xl"
      bg="glassBg"
      borderColor="glassBorder"
      backdropFilter="blur(10px)"
      _focusVisible={{
        borderColor: 'brand.400',
        boxShadow: '0 0 0 4px rgba(249,115,22,0.20)',
      }}
      {...props}
    />
  )
}
