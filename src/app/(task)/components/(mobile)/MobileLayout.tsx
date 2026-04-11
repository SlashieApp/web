'use client'

import { Box } from '@chakra-ui/react'

import { TaskBrowseAreaLocationInput } from '../TaskBrowseAreaLocationInput'
import { TaskBrowseActiveFilterTags } from '../TaskBrowseFilterTags'
import { TaskBrowseSearchThisAreaButton } from '../TaskBrowseSearchThisAreaButton'
import { MobileTaskBrowseFiltersDrawer } from './MobileTaskBrowseFiltersDrawer'
import { MobileTaskCarousel } from './MobileTaskCarousel'

export function MobileLayout() {
  return (
    <Box
      flex={1}
      minH={0}
      w="full"
      position="relative"
      minW={0}
      pointerEvents="none"
    >
      <Box
        position="absolute"
        top={3}
        left={3}
        right={3}
        zIndex={4}
        pointerEvents="none"
      >
        <Box mr={12}>
          <TaskBrowseAreaLocationInput />
          <TaskBrowseActiveFilterTags />
        </Box>
      </Box>

      <Box
        position="absolute"
        left={0}
        right={0}
        bottom={20}
        zIndex={3}
        display="flex"
        flexDirection="column"
        gap={2}
      >
        <TaskBrowseSearchThisAreaButton />

        <MobileTaskCarousel />
      </Box>

      <MobileTaskBrowseFiltersDrawer />
    </Box>
  )
}
