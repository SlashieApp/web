'use client'

import { Box, HStack } from '@chakra-ui/react'
import { Button } from '@ui'
import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../context/TaskBrowseProvider'

/** Mobile: filter trigger + compact active summary chips (task browse data context). */
export function TaskBrowseActiveFilterTags() {
  const { isFilterOpen, setIsFilterOpen } = useTaskBrowseLayout()

  const activeFilterTags: string[] = []

  return (
    <HStack mt={2} gap={2} flexWrap="wrap">
      <Button variant="primary" onClick={() => setIsFilterOpen(!isFilterOpen)}>
        Filters
      </Button>
      {activeFilterTags.map((tag) => (
        <Box
          pointerEvents="auto"
          key={tag}
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
