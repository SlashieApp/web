'use client'

import { Box } from '@chakra-ui/react'

import { Button } from '@ui'

export type SearchThisAreaButtonProps = {
  visible: boolean
  enabled: boolean
  position?: 'top' | 'bottom'
  leftInset?: string
  offsetX?: string
  onClick: () => void
}

export function SearchThisAreaButton({
  visible,
  enabled,

  onClick,
}: SearchThisAreaButtonProps) {
  if (!visible || !enabled) return null

  return (
    <Button
      pointerEvents="auto"
      type="button"
      size="sm"
      boxShadow="0 8px 28px rgba(15,23,42,0.22)"
      borderRadius="full"
      px={5}
      maxW="lg"
      mx="auto"
      onClick={onClick}
    >
      Search this area
    </Button>
  )
}
