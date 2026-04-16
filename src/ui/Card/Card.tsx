'use client'

import { Box, type BoxProps } from '@chakra-ui/react'

export type CardProps = BoxProps & {
  children?: React.ReactNode
}

/** Generic card wrapper; pass any content via `children`. */
export function Card({ children, ...rest }: CardProps) {
  return (
    <Box
      borderRadius="24px"
      bg="jobCardBg"
      borderWidth="1px"
      borderColor="jobCardBorder"
      p={6}
      maxW="md"
      w="full"
      {...rest}
    >
      {children}
    </Box>
  )
}
