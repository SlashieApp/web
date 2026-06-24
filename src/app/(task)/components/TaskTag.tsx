'use client'

import { Box, HStack } from '@chakra-ui/react'

import { Button } from '@ui'
import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../context/TaskBrowseProvider'
import type { BrowseFilterTag } from '../helpers/taskBrowseHelpers'

/** Tags from last submitted browse filters (see {@link useTaskBrowseData}). */
export function useActiveFilterTags(): readonly BrowseFilterTag[] {
  return useTaskBrowseData().activeFilterTags
}

function tagKey(tag: BrowseFilterTag, index: number): string {
  return `${tag.kind}-${index}-${tag.label}`
}

/** Compact chips for applied browse filters (filter open/close lives on {@link TaskSearch}). */
export function TaskTag() {
  const { activeFilterTags, syncDraftFiltersFromSubmitted } =
    useTaskBrowseData()
  const { isFilterOpen, setIsFilterOpen } = useTaskBrowseLayout()

  const openFilters = () => {
    if (!isFilterOpen) syncDraftFiltersFromSubmitted()
    setIsFilterOpen(true)
  }

  return (
    <HStack gap={2} flexWrap="wrap">
      {activeFilterTags.map((tag, index) => {
        const interactive = tag.kind === 'radius' || tag.kind === 'location'
        if (interactive) {
          return (
            <Button
              key={tagKey(tag, index)}
              type="button"
              size="xs"
              variant="ghost"
              pointerEvents="auto"
              px={2.5}
              py={1}
              h="auto"
              minH={0}
              borderRadius="full"
              bg="action.primary"
              color="text.onGreen"
              fontSize="xs"
              fontWeight={700}
              boxShadow="none"
              _hover={{ bg: 'action.primaryHover', color: 'text.onGreen' }}
              onClick={openFilters}
            >
              {tag.label}
            </Button>
          )
        }
        return (
          <Box
            key={tagKey(tag, index)}
            pointerEvents="auto"
            px={2.5}
            py={1}
            borderRadius="full"
            bg="action.primary"
            color="text.onGreen"
            fontSize="xs"
            fontWeight={700}
          >
            {tag.label}
          </Box>
        )
      })}
    </HStack>
  )
}
