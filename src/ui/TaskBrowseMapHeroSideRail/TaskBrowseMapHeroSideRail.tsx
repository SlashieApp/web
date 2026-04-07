'use client'

import { Box, type BoxProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { MAP_HERO_SIDE_RAIL_WIDTH } from '../taskBrowseMapHeroLayout'

export type TaskBrowseMapHeroSideRailProps = {
  /** Controls visibility of the scrollable columns (desktop always on when map hero is shown; mobile list tab). */
  panelDisplay: BoxProps['display']
  children: ReactNode
}

export function TaskBrowseMapHeroSideRail({
  panelDisplay,
  children,
}: TaskBrowseMapHeroSideRailProps) {
  return (
    <Box
      position="absolute"
      zIndex={2}
      top={{ base: 74, md: 92 }}
      left={{ base: 3, md: 5 }}
      bottom={{ base: 3, md: 5 }}
      w={MAP_HERO_SIDE_RAIL_WIDTH}
      maxW={{ base: '440px', md: 'none' }}
      display="flex"
      flexDirection="column"
      pointerEvents="none"
    >
      <Box
        flex={1}
        minH={0}
        minW={0}
        display={panelDisplay}
        flexDirection="column"
        pointerEvents="auto"
      >
        {children}
      </Box>
    </Box>
  )
}
