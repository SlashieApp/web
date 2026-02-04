'use client'

import { Button, type ButtonProps } from '@chakra-ui/react'

export type UiButtonProps = ButtonProps

export function UiButton(props: UiButtonProps) {
  return (
    <Button
      borderRadius="xl"
      transition="all 160ms ease"
      _hover={{ transform: 'translateY(-1px)' }}
      _active={{ transform: 'translateY(0px)', opacity: 0.92 }}
      {...props}
    />
  )
}
