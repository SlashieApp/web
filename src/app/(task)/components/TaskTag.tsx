'use client'

import { Box, HStack } from '@chakra-ui/react'

import { useTaskBrowseData } from '../context/TaskBrowseProvider'

/** Tags from last submitted browse filters (see {@link useTaskBrowseData}). */
export function useActiveFilterTags(): readonly string[] {
  return useTaskBrowseData().activeFilterTags
}

/** Compact chips for applied browse filters (filter open/close lives on {@link TaskSearch}). */
export function TaskTag() {
  const activeFilterTags = useActiveFilterTags()

  return (
    <HStack gap={2} flexWrap="wrap">
      {activeFilterTags.map((tag, index) => (
        <Box
          pointerEvents="auto"
          key={`${index}-${tag}`}
          px={2.5}
          py={1}
          borderRadius="full"
          bg="primary.600"
          color="white"
          fontSize="xs"
          fontWeight={700}
        >
          {tag}
        </Box>
      ))}
    </HStack>
  )
}
