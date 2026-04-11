'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'

import { TaskBrowseAreaLocationInput } from '../TaskBrowseAreaLocationInput'
import { TaskBrowseActiveFilterTags } from '../TaskBrowseFilterTags'
import { TaskBrowseSearchThisAreaButton } from '../TaskBrowseSearchThisAreaButton'
import { WebTaskBrowseFiltersBlock } from './TaskBrowseFilters'

export function WebLayout() {
  return (
    <Box flex={1} minH={0} w="full" position="relative">
      <Box
        position="absolute"
        zIndex={2}
        top={2}
        left={2}
        bottom={2}
        w={{ base: 'calc(100% - 24px)', md: 'min(420px, 38vw)' }}
        maxW="440px"
        display="flex"
        flexDirection="column"
        pointerEvents="auto"
      >
        <Box
          px={{ base: 1, md: 0 }}
          pb={2}
          display="flex"
          justifyContent="flex-start"
        >
          <Box borderRadius="xl" px={2} py={1.5} w="full">
            <Stack gap={2}>
              <TaskBrowseAreaLocationInput />
              <HStack gap={1.5} flexWrap="wrap">
                <TaskBrowseActiveFilterTags />
              </HStack>
            </Stack>
          </Box>
        </Box>
        <WebTaskBrowseFiltersBlock />
      </Box>

      <TaskBrowseSearchThisAreaButton overlay />
    </Box>
  )
}
