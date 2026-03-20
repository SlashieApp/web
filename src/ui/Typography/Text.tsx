'use client'

import { Text as ChakraText, type TextProps } from '@chakra-ui/react'

export type UiTextProps = TextProps

export function Text(props: UiTextProps) {
  return <ChakraText fontFamily="body" {...props} />
}
