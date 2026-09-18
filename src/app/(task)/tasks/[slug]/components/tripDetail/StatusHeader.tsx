'use client'

import { Box } from '@chakra-ui/react'

/**
 * Mobile map hero spacer. The Mapbox canvas lives in the (task) layout so
 * search → detail can keep the same instance; this band is the visible window
 * onto that map above the overlapping chrome.
 */
export function StatusHeader() {
  return (
    <Box
      w="full"
      minH={{ base: '300px', md: '360px' }}
      pointerEvents="none"
      aria-hidden
    />
  )
}
