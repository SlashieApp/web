'use client'

import { Box } from '@chakra-ui/react'

import { COMPACT_DETAIL_HERO_H } from '@/app/(task)/helpers/marketplaceMap'

/**
 * Mobile map hero spacer. The Mapbox canvas lives in the (task) layout so
 * search → detail can keep the same instance; this band is the visible window
 * onto that map above the overlapping chrome.
 */
export function StatusHeader() {
  return (
    <Box
      w="full"
      minH={COMPACT_DETAIL_HERO_H}
      pointerEvents="none"
      aria-hidden
    />
  )
}
