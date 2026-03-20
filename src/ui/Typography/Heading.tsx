'use client'

import { Heading as ChakraHeading, type HeadingProps } from '@chakra-ui/react'

export type UiHeadingProps = HeadingProps

export function Heading({ letterSpacing, ...props }: UiHeadingProps) {
  return (
    <ChakraHeading
      fontFamily="heading"
      letterSpacing={letterSpacing ?? '-0.02em'}
      {...props}
    />
  )
}
