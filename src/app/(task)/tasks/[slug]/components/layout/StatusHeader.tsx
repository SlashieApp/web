'use client'

import { Box } from '@chakra-ui/react'

import { COMPACT_DETAIL_HERO_H } from '@/app/(task)/helpers/marketplaceMap'

/**
 * Mobile/tablet map hero window. The Mapbox canvas stays in the layout;
 * this band is only the visible peek — the fade lives on the task header.
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
