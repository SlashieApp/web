'use client'

import { Box, type BoxProps } from '@chakra-ui/react'

export type GlassCardProps = BoxProps

export function GlassCard(props: GlassCardProps) {
  return (
    <Box
      borderRadius="xl"
      bg="surfaceContainerLowest"
      boxShadow="ghostBorder"
      transition="all 180ms ease"
      _hover={{ transform: 'translateY(-1px)' }}
      {...props}
    />
  )
}
