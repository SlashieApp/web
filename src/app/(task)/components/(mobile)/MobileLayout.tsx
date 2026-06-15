'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'

import { PostTaskFloatingButton } from '../PostTaskFloatingButton'
import { TaskBrowseSearchThisAreaButton } from '../TaskBrowseSearchThisAreaButton'
import { TaskSearch } from '../TaskSearch'
import { TaskTag } from '../TaskTag'
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
        <Stack gap={2} flexShrink={0} mr={12}>
          <TaskSearch />
          <HStack gap={1.5} flexWrap="wrap">
            <TaskTag />
          </HStack>
        </Stack>
      </Box>

      <Box
        position="absolute"
        left={0}
        right={0}
        bottom={8}
        zIndex={3}
        pointerEvents="auto"
      >
        <Box position="relative">
          <PostTaskFloatingButton />
          <Stack gap={2}>
            <TaskBrowseSearchThisAreaButton />
            <MobileTaskCarousel />
          </Stack>
        </Box>
      </Box>

      <MobileTaskBrowseFiltersDrawer />
    </Box>
  )
}
