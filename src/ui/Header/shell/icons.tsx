'use client'

import { Box } from '@chakra-ui/react'

/** Hamburger icon for mobile menu / dashboard section triggers. */
export function MenuIcon({ title = 'Menu' }: { title?: string }) {
  return (
    <Box as="span" display="flex" color="currentColor" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <title>{title}</title>
        <path
          d="M4 7h16M4 12h16M4 17h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Box>
  )
}

/**
 * Decorative bell for the notifications IconButton. The wrapping IconButton
 * supplies the accessible name via aria-label; this svg is aria-hidden.
 */
export function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <title>Notifications</title>
      <path
        d="M6 16h12l-1.5-2.2v-3.5a4.5 4.5 0 0 0-9 0v3.5L6 16Zm4 2a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
