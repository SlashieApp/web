'use client'

import { Box, type BoxProps } from '@chakra-ui/react'

export type CardProps = BoxProps & {
  children?: React.ReactNode
  /** Highlights the card border for selected/active states. */
  isActive?: boolean
  activeBorderColor?: BoxProps['borderColor']
}

/** Generic card wrapper; pass any content via `children`. */
export function Card({
  children,
  isActive = false,
  activeBorderColor = 'secondary',
  ...rest
}: CardProps) {
  return (
    <Box
      borderRadius="24px"
      bg="cardBg"
      borderWidth="1px"
      borderColor={isActive ? activeBorderColor : 'cardBorder'}
      p={6}
      maxW="md"
      w="full"
      {...rest}
    >
      {children}
    </Box>
  )
}
