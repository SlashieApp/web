'use client'

import { Box, type BoxProps } from '@chakra-ui/react'

const iconWrap = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: 'formLabelMuted',
} as const

export function IconMapPin(props: BoxProps) {
  return (
    <Box as="span" w="16px" h="16px" {...iconWrap} {...props}>
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Location</title>
        <path
          d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="11"
          r="2.25"
          stroke="currentColor"
          strokeWidth="1.75"
        />
      </svg>
    </Box>
  )
}

export function IconCalendar(props: BoxProps) {
  return (
    <Box as="span" w="16px" h="16px" {...iconWrap} {...props}>
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Posted date</title>
        <rect
          x="3.5"
          y="5.5"
          width="17"
          height="15"
          rx="2.5"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M8 3.5v4M16 3.5v4M3.5 10.5h17"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

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
