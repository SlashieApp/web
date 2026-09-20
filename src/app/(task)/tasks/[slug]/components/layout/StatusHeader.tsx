'use client'

import { Box } from '@chakra-ui/react'

import {
  COMPACT_DETAIL_HERO_H,
  MAP_FADE_BOTTOM,
  marketplaceMapMotion,
} from '@/app/(task)/helpers/marketplaceMap'

/**
 * Mobile/tablet map hero. The Mapbox canvas stays in the layout; this band
 * is the visible window and owns the compact detail fade (not the map).
 */
export function StatusHeader() {
  return (
    <Box
      position="relative"
      w="full"
      minH={COMPACT_DETAIL_HERO_H}
      pointerEvents="none"
      aria-hidden
      overflow="hidden"
    >
      <Box
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        h="full"
        backgroundImage={MAP_FADE_BOTTOM}
        css={{
          transitionProperty: marketplaceMapMotion.transitionProperty,
          transitionDuration: marketplaceMapMotion.duration,
          transitionTimingFunction: marketplaceMapMotion.easing,
          '@starting-style': { height: '0px' },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        }}
      />
    </Box>
  )
}
