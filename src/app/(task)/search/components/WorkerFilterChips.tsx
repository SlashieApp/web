'use client'

import { Box, HStack } from '@chakra-ui/react'

import { Button } from '@ui'

import {
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../../context/TaskBrowseProvider'
import { useWorkerSearch } from '../context/WorkerSearchProvider'

/**
 * Applied-filter chips for worker mode (visual twin of `TaskTag`): shared
 * location + radius chips open the filter panel; verified/search chips echo
 * the submitted worker filters.
 */
export function WorkerFilterChips() {
  const {
    referenceLocation,
    submittedRadiusMiles,
    syncDraftFiltersFromSubmitted,
  } = useTaskBrowseData()
  const {
    submittedWorkerSearchText,
    submittedVerifiedOnly,
    syncWorkerDraftFromSubmitted,
  } = useWorkerSearch()
  const { isFilterOpen, setIsFilterOpen } = useTaskBrowseLayout()

  const openFilters = () => {
    if (!isFilterOpen) {
      syncDraftFiltersFromSubmitted()
      syncWorkerDraftFromSubmitted()
    }
    setIsFilterOpen(true)
  }

  const interactiveChips = [
    { key: 'location', label: referenceLocation.label },
    { key: 'radius', label: `${Math.round(submittedRadiusMiles)} miles` },
  ]

  const staticChips = [
    submittedVerifiedOnly ? { key: 'verified', label: 'Verified' } : null,
    submittedWorkerSearchText
      ? { key: 'search', label: `“${submittedWorkerSearchText}”` }
      : null,
  ].filter((chip): chip is { key: string; label: string } => chip !== null)

  return (
    <HStack gap={2} flexWrap="wrap">
      {interactiveChips.map((chip) => (
        <Button
          key={chip.key}
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
          {chip.label}
        </Button>
      ))}
      {staticChips.map((chip) => (
        <Box
          key={chip.key}
          pointerEvents="auto"
          px={2.5}
          py={1}
          borderRadius="full"
          bg="action.primary"
          color="text.onGreen"
          fontSize="xs"
          fontWeight={700}
        >
          {chip.label}
        </Box>
      ))}
    </HStack>
  )
}
