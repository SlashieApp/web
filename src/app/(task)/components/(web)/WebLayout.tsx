'use client'

import { Box, HStack, Stack } from '@chakra-ui/react'

import { TaskBrowseSearchThisAreaButton } from '../TaskBrowseSearchThisAreaButton'
import { TaskSearch } from '../TaskSearch'
import { TaskTag } from '../TaskTag'
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
        w={{ base: 'calc(100% - 24px)', md: '460px' }}
        maxW="460px"
        display="flex"
        flexDirection="column"
        pointerEvents="none"
      >
        <Box
          px={{ base: 1, md: 0 }}
          pb={2}
          flex={1}
          minH={0}
          display="flex"
          flexDirection="column"
          w="full"
        >
          <Stack gap={2} flexShrink={0}>
            <TaskSearch />
            <HStack gap={1.5} flexWrap="wrap">
              <TaskTag />
            </HStack>
          </Stack>

          <Box flex={1} minH={0} w="full" px={2}>
            <WebTaskBrowseFiltersBlock />
          </Box>
        </Box>
      </Box>

      <TaskBrowseSearchThisAreaButton overlay />
    </Box>
  )
}
