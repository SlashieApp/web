'use client'

import { Box, HStack, type StackProps } from '@chakra-ui/react'

import { Heading } from '../Typography'

export type HandyBoxWordmarkProps = StackProps & {
  /** Larger logo tile for auth headers */
  size?: 'md' | 'lg'
}

export function HandyBoxWordmark({
  size = 'md',
  gap = 3,
  ...props
}: HandyBoxWordmarkProps) {
  const tile =
    size === 'lg'
      ? { boxSize: 11, iconW: 22, iconH: 22 }
      : { boxSize: 9, iconW: 18, iconH: 18 }

  return (
    <HStack gap={gap} align="center" {...props}>
      <Box
        boxSize={tile.boxSize}
        borderRadius="lg"
        bg="primary.500"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
        boxShadow="ambient"
        aria-hidden
      >
        <svg
          width={tile.iconW}
          height={tile.iconH}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <title>HandyBox mark</title>
          <path
            d="M5 19V10.5L12 6l7 4.5V19h-3v-6.5L12 9.2 8 12.5V19H5Z"
            stroke="white"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M14 8.5L17.5 6.5"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </Box>
      <Heading size={size === 'lg' ? 'lg' : 'md'} color="primary.600" mb={0}>
        HandyBox
      </Heading>
    </HStack>
  )
}
