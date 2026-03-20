'use client'

import type { InputProps } from '@chakra-ui/react'

import { Input } from './Input'

export type TextInputProps = InputProps

export function TextInput(props: TextInputProps) {
  return <Input bg="surfaceContainerLowest" {...props} />
}
