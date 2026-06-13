'use client'

import { Box } from '@chakra-ui/react'

export function FieldIconMail() {
  return (
    <Box as="span" color="formLabelMuted" display="flex" aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <title>Email</title>
        <path
          d="M4 6h16v12H4V6Zm0 0 8 6 8-6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}

export function IconLockReset() {
  return (
    <Box color="primary.700" display="flex" aria-hidden>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <title>Reset password</title>
        <path
          d="M12 3a6 6 0 0 0-6 6v3H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1V9a6 6 0 0 0-6-6Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M15.5 9.5a3.5 3.5 0 1 0-7 0V12"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M17 8V5M17 5h3M17 5h-3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

export function IconArrowRight() {
  return (
    <Box as="span" display="inline-flex" ml={1.5} aria-hidden>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <title>Continue</title>
        <path
          d="M5 12h14m0 0-4-4m4 4-4 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Box>
  )
}
