'use client'

import { Box, type BoxProps } from '@chakra-ui/react'

const iconWrap = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  color: 'muted',
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

export function IconClock(props: BoxProps) {
  return (
    <Box as="span" w="16px" h="16px" {...iconWrap} {...props}>
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Posted</title>
        <circle
          cx="12"
          cy="12"
          r="8.25"
          stroke="currentColor"
          strokeWidth="1.75"
        />
        <path
          d="M12 7.5V12l3 2"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

export function IconWrench(props: BoxProps) {
  return (
    <Box as="span" w="16px" h="16px" {...iconWrap} {...props}>
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Category</title>
        <path
          d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.36 6.36a2.83 2.83 0 1 1-4-4l6.36-6.36a6 6 0 0 1 7.94-7.94l-3.77 3.77Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

export function IconSliders(props: BoxProps) {
  return (
    <Box as="span" w="18px" h="18px" {...iconWrap} {...props}>
      <svg viewBox="0 0 24 24" fill="none" width="100%" height="100%">
        <title>Sort</title>
        <path
          d="M4 6h16M8 12h8M10 18h4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="7" cy="6" r="1.75" fill="currentColor" />
        <circle cx="16" cy="12" r="1.75" fill="currentColor" />
        <circle cx="13" cy="18" r="1.75" fill="currentColor" />
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
