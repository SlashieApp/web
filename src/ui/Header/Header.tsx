'use client'

import { Box, type BoxProps } from '@chakra-ui/react'

import { Container } from '../Container'

export type HeaderProps = {
  children: React.ReactNode
} & Omit<BoxProps, 'children'>

export function Header({ children, ...props }: HeaderProps) {
  return (
    <Box
      as="header"
      bg="surfaceBright"
      borderRadius="xl"
      backdropFilter="blur(20px)"
      boxShadow="ambient"
      px={{ base: 2, md: 0 }}
      py={1}
      {...props}
    >
      <Container>{children}</Container>
    </Box>
  )
}
