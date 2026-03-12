'use client'

import { type ButtonProps, Button as ChakraButton } from '@chakra-ui/react'

export type UiButtonProps = ButtonProps & {
  href?: string
}

export function Button(props: UiButtonProps) {
  return (
    <ChakraButton
      borderRadius="xl"
      transition="all 160ms ease"
      px={4}
      _hover={{ transform: 'translateY(-1px)' }}
      _active={{ transform: 'translateY(0px)', opacity: 0.92 }}
      {...props}
    />
  )
}
