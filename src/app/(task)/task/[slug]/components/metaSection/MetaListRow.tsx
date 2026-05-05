'use client'

import type { ReactNode } from 'react'

import { Box } from '@chakra-ui/react'

/** Uniform vertical padding + optional bottom divider between rows. */
export function MetaListRow({
  children,
  withDivider = true,
}: {
  children: ReactNode
  withDivider?: boolean
}) {
  return (
    <Box
      py={4}
      borderBottomWidth={withDivider ? '1px' : '0'}
      borderColor="cardDivider"
    >
      {children}
    </Box>
  )
}
