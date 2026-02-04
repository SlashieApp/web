'use client'

import { Box, type BoxProps } from '@chakra-ui/react'

export type GlassCardProps = BoxProps

export function GlassCard(props: GlassCardProps) {
  return (
    <Box
      borderRadius="xl"
      borderWidth="1px"
      borderColor="glassBorder"
      bg="glassBg"
      backdropFilter="blur(12px)"
      boxShadow="glass"
      transition="all 180ms ease"
      _hover={{ transform: 'translateY(-2px)' }}
      {...props}
    />
  )
}
