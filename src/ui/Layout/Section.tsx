'use client'

import { Box, type BoxProps } from '@chakra-ui/react'

import { Container } from '../Container'

export type SectionPadding = { base: number; md: number }

export type SectionProps = {
  children: React.ReactNode
  py?: SectionPadding
} & Omit<BoxProps, 'children'>

export function Section({
  id,
  children,
  py = { base: 8, md: 12 },
  ...props
}: SectionProps) {
  return (
    <Box as="section" id={id} py={py} {...props}>
      <Container>{children}</Container>
    </Box>
  )
}
