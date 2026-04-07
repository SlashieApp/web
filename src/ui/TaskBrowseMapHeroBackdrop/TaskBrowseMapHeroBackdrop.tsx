'use client'

import { Box, type BoxProps } from '@chakra-ui/react'

import { MAP_HERO_SIDE_RAIL_WIDTH } from '../taskBrowseMapHeroLayout'

export type TaskBrowseMapHeroBackdropProps = Omit<BoxProps, 'children'>

export function TaskBrowseMapHeroBackdrop({
  display,
  ...rest
}: TaskBrowseMapHeroBackdropProps) {
  return (
    <Box
      position="absolute"
      zIndex={1}
      top={{ base: 70, md: 88 }}
      left={{ base: 3, md: 5 }}
      bottom={{ base: 3, md: 5 }}
      w={MAP_HERO_SIDE_RAIL_WIDTH}
      maxW={{ base: '480px', md: 'none' }}
      pointerEvents="none"
      borderRadius="2xl"
      bg="linear-gradient(90deg, rgba(248,250,252,0.82) 0%, rgba(248,250,252,0.62) 52%, rgba(248,250,252,0.12) 100%)"
      backdropFilter="blur(8px)"
      maskImage="linear-gradient(to right, black 65%, transparent 100%)"
      display={display}
      {...rest}
    />
  )
}
