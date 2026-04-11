'use client'

import { formatTaskCategoryLabel } from '@/utils/taskLocationDisplay'
import { Badge, Box, Button, HStack } from '@chakra-ui/react'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../context/TaskBrowseProvider'

import { SORT_OPTIONS } from '../helpers/taskBrowseHelpers'

/** Mobile: filter trigger + compact active summary chips (task browse data context). */
export function TaskBrowseActiveFilterTags() {
  const { selectedCategorySet, radiusMiles, urgency, categories } =
    useTaskBrowseData()
  const { isFilterOpen, setIsFilterOpen } = useTaskBrowseLayout()

  const activeFilterTags: string[] = []
  if (
    selectedCategorySet.size > 0 &&
    selectedCategorySet.size < categories.length
  ) {
    activeFilterTags.push(
      ...[...selectedCategorySet]
        .slice(0, 3)
        .map((c) => formatTaskCategoryLabel(c)),
    )
  }
  if (urgency !== 'any') {
    activeFilterTags.push(
      urgency === 'emergency'
        ? 'Emergency'
        : urgency === 'today'
          ? 'Today'
          : 'This week',
    )
  }
  activeFilterTags.push(`${radiusMiles}mi`)

  return (
    <HStack mt={2} gap={2} flexWrap="wrap">
      <Button
        type="button"
        pointerEvents="auto"
        size="sm"
        variant={isFilterOpen ? 'solid' : 'subtle'}
        borderRadius="full"
        px={3}
        py={1.5}
        onClick={() => setIsFilterOpen(!isFilterOpen)}
      >
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
