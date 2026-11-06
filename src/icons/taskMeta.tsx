'use client'

import { Box, type BoxProps } from '@chakra-ui/react'

const iconWrap = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: 'text.muted',
} as const

export function IconDocument(props: BoxProps) {
  return (
    <Box as="span" w="18px" h="18px" {...iconWrap} {...props}>
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Job description</title>
        <path
          d="M14.5 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5L14.5 2Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path
          d="M14 2v6h6M9 13h6M9 17h4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}
